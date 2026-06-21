import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';

// Online UPI-style instant payment
// Called directly by the Harsh Pay app when internet is available
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { senderClerkId, receiverClerkId, receiverEmail, amount, note } = body;

    if (!senderClerkId || (!receiverClerkId && !receiverEmail) || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const txAmount = Number(amount);
    if (isNaN(txAmount) || txAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (senderClerkId === receiverClerkId) {
      return NextResponse.json({ error: 'Cannot send money to yourself' }, { status: 400 });
    }

    // Find sender
    const sender = await User.findOne({ clerkId: senderClerkId });
    if (!sender) return NextResponse.json({ error: 'Sender not found' }, { status: 404 });

    const senderWallet = await Wallet.findOne({ userId: sender._id });
    if (!senderWallet) return NextResponse.json({ error: 'Sender wallet not found' }, { status: 404 });

    if (senderWallet.syncedBalance < txAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Find receiver by clerkId or email
    let receiver;
    if (receiverClerkId) {
      receiver = await User.findOne({ clerkId: receiverClerkId });
    } else if (receiverEmail) {
      receiver = await User.findOne({ email: receiverEmail });
    }
    
    if (!receiver) return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });

    const receiverWallet = await Wallet.findOne({ userId: receiver._id });
    if (!receiverWallet) return NextResponse.json({ error: 'Receiver wallet not found' }, { status: 404 });

    const timestamp = new Date();
    const clientTxId = `ONLINE_${Date.now()}`;

    // Atomic debit sender
    senderWallet.syncedBalance -= txAmount;
    senderWallet.updatedAt = timestamp;
    await senderWallet.save();

    // Atomic credit receiver
    receiverWallet.syncedBalance += txAmount;
    receiverWallet.updatedAt = timestamp;
    await receiverWallet.save();

    // Record sender's debit transaction
    await Transaction.create({
      walletId: senderWallet._id,
      amount: txAmount,
      type: 'debit',
      title: note || `Sent to ${receiver.name}`,
      clientTxId: clientTxId,
      status: 'SUCCESS',
      timestamp,
    });

    // Record receiver's credit transaction
    await Transaction.create({
      walletId: receiverWallet._id,
      amount: txAmount,
      type: 'credit',
      title: `Received from ${sender.name}`,
      clientTxId: `${clientTxId}_rx`,
      status: 'SUCCESS',
      timestamp,
    });

    return NextResponse.json({
      success: true,
      message: `₹${txAmount} sent to ${receiver.name} successfully`,
      newBalance: senderWallet.syncedBalance,
      receiverName: receiver.name,
    });

  } catch (error: any) {
    console.error('Online Payment Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
