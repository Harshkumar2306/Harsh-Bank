import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { transactions, clerkId } = body;

    if (!clerkId) {
      return NextResponse.json({ error: 'Missing clerkId' }, { status: 400 });
    }

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: 'Invalid transactions array' }, { status: 400 });
    }

    // Find user and wallet
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const results = [];
    let currentBalance = wallet.syncedBalance;
    let currentOfflineBalance = wallet.lockedOfflineBalance || 0.0;

    // Process transactions sequentially to ensure balance integrity
    for (const tx of transactions) {
      const amount = Number(tx.amount);
      const isDebit = tx.type === 'debit';
      
      // Parse encoded IDs from txId
      // NEW FORMAT: uuid::receiverId::senderId
      // OLD FORMAT: uuid::receiverId
      const parts = String(tx.id).split('::');
      const cleanTxId = parts[0];
      const intendedReceiverId = parts.length > 1 ? parts[1] : null;
      const encodedSenderId = parts.length > 2 ? parts[2] : null;
      const txTimestamp = tx.timestamp ? new Date(tx.timestamp) : new Date();

      // Ensure unique clientTxId for sender and receiver
      const serverTxId = isDebit ? tx.id : `${tx.id}_rx`;

      // Check if transaction already exists (idempotency)
      const existingTx = await Transaction.findOne({ clientTxId: serverTxId });
      if (existingTx) {
        results.push({ transactionId: tx.id, status: 'ALREADY_PROCESSED' });
        continue;
      }

      if (isDebit) {
        // ═══════════════════════════════════════════════════════
        // SENDER LOGIC — TWO-WAY ESCROW
        // ═══════════════════════════════════════════════════════

        // SECURITY: Verify the sender ID encoded in the txId matches the syncing user
        if (encodedSenderId && encodedSenderId !== clerkId) {
          results.push({ transactionId: tx.id, status: 'FAILED', reason: 'Sender ID mismatch' });
          continue;
        }

        // Look for the receiver's matching credit (which would be `${tx.id}_rx`)
        const matchingCredit = await Transaction.findOne({
          clientTxId: `${tx.id}_rx`
        });

        if (matchingCredit) {
          // RECEIVER HAS ALREADY UPLOADED THEIR PROOF!
          // Perform cryptographic verification to release escrow
          const amountMatch = matchingCredit.amount === amount;
          const senderMatch = !matchingCredit.senderId || matchingCredit.senderId === clerkId;
          const receiverMatch = !intendedReceiverId || !matchingCredit.receiverId || matchingCredit.receiverId === intendedReceiverId;

          if (amountMatch && senderMatch && receiverMatch) {
            // VERIFICATION PASSED! SETTLE ESCROW!
            currentOfflineBalance -= amount; // Deduct from sender's offline vault
            await Transaction.create({
              walletId: wallet._id,
              amount: amount,
              type: 'debit',
              title: tx.title || 'Offline Payment Sent',
              clientTxId: serverTxId,
              senderId: clerkId,
              receiverId: intendedReceiverId,
              status: 'SUCCESS',
              timestamp: txTimestamp,
            });
            results.push({ transactionId: tx.id, status: 'SUCCESS' });

            // Update Receiver's balance AND mark their credit as SUCCESS
            matchingCredit.status = 'SUCCESS';
            await matchingCredit.save();
            
            const receiverUser = await User.findOne({ clerkId: intendedReceiverId });
            if (receiverUser) {
              const receiverWallet = await Wallet.findOne({ userId: receiverUser._id });
              if (receiverWallet) {
                receiverWallet.syncedBalance += amount;
                receiverWallet.updatedAt = new Date();
                await receiverWallet.save();
              }
            }
          } else {
            // Parameter mismatch = potential fraud attempt
            results.push({ transactionId: tx.id, status: 'FAILED', reason: 'Zero-Trust parameter mismatch' });
            matchingCredit.status = 'FAILED';
            matchingCredit.title = `SECURITY: Verification failed (amt:${amountMatch} snd:${senderMatch} rcv:${receiverMatch})`;
            await matchingCredit.save();
          }
        } else {
          // RECEIVER HAS NOT SYNCED YET → ESCROW PENDING
          await Transaction.create({
            walletId: wallet._id,
            amount: amount,
            type: 'debit',
            title: tx.title || 'Offline Payment Sent',
            clientTxId: serverTxId,
            senderId: clerkId,
            receiverId: intendedReceiverId,
            status: 'PENDING', // Will be settled when receiver syncs
            timestamp: txTimestamp,
          });
          // Do NOT deduct balance. Return WAITING so the app knows it hasn't settled yet
          results.push({ transactionId: tx.id, status: 'WAITING_FOR_RECEIVER' });
        }

      } else {
        // ═══════════════════════════════════════════════════════
        // RECEIVER LOGIC — TWO-WAY ESCROW
        // ═══════════════════════════════════════════════════════

        // Look for the sender's matching debit
        const matchingDebit = await Transaction.findOne({
           clientTxId: tx.id, // Sender uses the exact tx.id
           type: 'debit'
        });

        if (matchingDebit) {
          // SENDER HAS ALREADY UPLOADED THEIR PROOF!
          // Perform cryptographic verification to release escrow
          const amountMatch = matchingDebit.amount === amount;
          const senderMatch = !encodedSenderId || !matchingDebit.senderId || matchingDebit.senderId === encodedSenderId;
          const receiverMatch = !intendedReceiverId || !matchingDebit.receiverId || matchingDebit.receiverId === clerkId;

          // TIMESTAMP CHECK: Must be within 24 hours of each other
          let timestampValid = true;
          if (matchingDebit.timestamp && txTimestamp) {
            const timeDiff = Math.abs(new Date(matchingDebit.timestamp).getTime() - txTimestamp.getTime());
            timestampValid = timeDiff < 24 * 60 * 60 * 1000; // 24 hours
          }

          if (amountMatch && senderMatch && receiverMatch && timestampValid) {
             // VERIFICATION PASSED! SETTLE ESCROW!
             currentBalance += amount; // Add to receiver
             await Transaction.create({
               walletId: wallet._id,
               amount: amount,
               type: 'credit',
               title: tx.title || 'Offline Payment Received',
               clientTxId: serverTxId,
               senderId: encodedSenderId,
               receiverId: clerkId,
               status: 'SUCCESS',
               timestamp: txTimestamp,
             });
             results.push({ transactionId: tx.id, status: 'SUCCESS' });

             // Update Sender's balance AND mark their debit as SUCCESS
             matchingDebit.status = 'SUCCESS';
             await matchingDebit.save();

             const senderUser = await User.findOne({ clerkId: encodedSenderId });
             if (senderUser) {
               const senderWallet = await Wallet.findOne({ userId: senderUser._id });
               if (senderWallet) {
                 senderWallet.lockedOfflineBalance -= amount;
                 senderWallet.updatedAt = new Date();
                 await senderWallet.save();
               }
             }
          } else {
             results.push({ transactionId: tx.id, status: 'FAILED', reason: 'Zero-Trust parameter mismatch or expired' });
             matchingDebit.status = 'FAILED';
             matchingDebit.title = `SECURITY: Verification failed or expired`;
             await matchingDebit.save();
          }
        } else {
           // SENDER HAS NOT SYNCED YET → ESCROW PENDING
           await Transaction.create({
             walletId: wallet._id,
             amount: amount,
             type: 'credit',
             title: tx.title || 'Offline Payment Received',
             clientTxId: serverTxId,
             senderId: encodedSenderId,
             receiverId: clerkId,
             status: 'PENDING', // Will be settled when sender syncs
             timestamp: txTimestamp,
           });
           // Do NOT add balance. Return WAITING so the app knows it hasn't settled yet
           results.push({ transactionId: tx.id, status: 'WAITING_FOR_SENDER' });
        }
      }
    }

    // Save final wallet balance
    wallet.syncedBalance = currentBalance;
    wallet.lockedOfflineBalance = currentOfflineBalance;
    wallet.updatedAt = new Date();
    await wallet.save();

    return NextResponse.json({
      message: 'Sync completed',
      updatedBalance: currentBalance,
      results: results
    });

  } catch (error: any) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
