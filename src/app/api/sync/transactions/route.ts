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

    // Process transactions sequentially to ensure balance integrity
    for (const tx of transactions) {
      const amount = Number(tx.amount);
      const isDebit = tx.type === 'debit';
      
      // Parse encoded receiver ID from txId (format: uuid::receiverId)
      const parts = String(tx.id).split('::');
      const cleanTxId = parts[0];
      const intendedReceiverId = parts.length > 1 ? parts[1] : null;

      // Ensure unique clientTxId for sender and receiver
      const serverTxId = isDebit ? tx.id : `${tx.id}_rx`;

      // Check if transaction already exists (idempotency)
      const existingTx = await Transaction.findOne({ clientTxId: serverTxId });
      if (existingTx) {
        results.push({ transactionId: tx.id, status: 'ALREADY_PROCESSED' });
        continue;
      }

      if (isDebit) {
        // SENDER LOGIC: Always deduct sender unconditionally
        currentBalance -= amount;

        await Transaction.create({
          walletId: wallet._id,
          amount: amount,
          type: 'debit',
          title: tx.title || 'Offline Payment Sent',
          clientTxId: serverTxId,
          status: 'SUCCESS',
          timestamp: new Date(tx.timestamp || Date.now()),
        });

        results.push({ transactionId: tx.id, status: 'SUCCESS' });

        // Match-and-Settle: Check if receiver ALREADY synced their credit, which would be PENDING
        if (intendedReceiverId) {
          const receiverUser = await User.findOne({ clerkId: intendedReceiverId });
          if (receiverUser) {
            const receiverWallet = await Wallet.findOne({ userId: receiverUser._id });
            if (receiverWallet) {
               const pendingCredit = await Transaction.findOne({
                 clientTxId: `${tx.id}_rx`,
                 status: 'PENDING'
               });
               // Only settle if amounts match cryptographically!
               if (pendingCredit && pendingCredit.amount === amount) {
                 pendingCredit.status = 'SUCCESS';
                 await pendingCredit.save();
                 receiverWallet.syncedBalance += amount;
                 receiverWallet.updatedAt = new Date();
                 await receiverWallet.save();
               } else if (pendingCredit) {
                 pendingCredit.status = 'FAILED';
                 pendingCredit.title = 'Amount Spoofing Detected';
                 await pendingCredit.save();
               }
            }
          }
        }
      } else {
        // RECEIVER LOGIC: Zero-Trust. Check if matching debit exists.
        const matchingDebit = await Transaction.findOne({
           clientTxId: tx.id, // Sender uses the exact tx.id
           type: 'debit'
        });

        if (matchingDebit && matchingDebit.amount === amount) {
           // SENDER HAS ALREADY SYNCED! Settle it instantly!
           currentBalance += amount;
           await Transaction.create({
             walletId: wallet._id,
             amount: amount,
             type: 'credit',
             title: tx.title || 'Offline Payment Received',
             clientTxId: serverTxId,
             status: 'SUCCESS',
             timestamp: new Date(tx.timestamp || Date.now()),
           });
           results.push({ transactionId: tx.id, status: 'SUCCESS' });
        } else {
           // SENDER HAS NOT SYNCED YET, OR AMOUNT MISMATCH! Put in PENDING.
           await Transaction.create({
             walletId: wallet._id,
             amount: amount,
             type: 'credit',
             title: tx.title || 'Offline Payment Received',
             clientTxId: serverTxId,
             status: 'PENDING', // Will be settled when sender syncs
             timestamp: new Date(tx.timestamp || Date.now()),
           });
           // Return WAITING so the app knows it hasn't settled yet
           results.push({ transactionId: tx.id, status: 'WAITING_FOR_SENDER' });
        }
      }
    }

    // Save final wallet balance
    wallet.syncedBalance = currentBalance;
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
