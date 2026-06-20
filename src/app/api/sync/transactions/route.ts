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
      // Check if transaction already exists (idempotency)
      const existingTx = await Transaction.findOne({ clientTxId: tx.id });
      if (existingTx) {
        results.push({ transactionId: tx.id, status: 'ALREADY_PROCESSED' });
        continue;
      }

      // Determine amount to add/subtract
      const amount = Number(tx.amount);
      const isDebit = tx.type === 'debit';
      
      // Parse encoded receiver ID from txId (format: uuid::receiverId)
      const parts = String(tx.id).split('::');
      const cleanTxId = parts[0];
      const receiverId = parts.length > 1 ? parts[1] : null;

      // Update sender's balance
      if (isDebit) {
        currentBalance -= amount;
      } else {
        currentBalance += amount;
      }

      // Save sender's transaction
      await Transaction.create({
        walletId: wallet._id,
        amount: amount,
        type: tx.type,
        title: tx.title || (isDebit ? 'Offline Payment Sent' : 'Offline Payment Received'),
        clientTxId: cleanTxId,
        status: 'SUCCESS',
        timestamp: new Date(tx.timestamp || Date.now()),
      });

      // If this is a debit (sender syncing) and we have a receiver, CREDIT THE RECEIVER!
      if (isDebit && receiverId && receiverId !== 'unknown') {
        const receiverUser = await User.findOne({ clerkId: receiverId });
        if (receiverUser) {
          const receiverWallet = await Wallet.findOne({ userId: receiverUser._id });
          if (receiverWallet) {
            receiverWallet.syncedBalance += amount;
            receiverWallet.updatedAt = new Date();
            await receiverWallet.save();

            await Transaction.create({
              walletId: receiverWallet._id,
              amount: amount,
              type: 'credit',
              title: `Received offline from ${user.name || 'User'}`,
              clientTxId: `${cleanTxId}_rx`, // Unique ID for receiver side
              status: 'SUCCESS',
              timestamp: new Date(tx.timestamp || Date.now()),
            });
          }
        }
      }

      results.push({ transactionId: tx.id, status: 'SUCCESS' });
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
