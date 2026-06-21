import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Wallet from '@/models/Wallet';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function GET() {
  await connectToDatabase();
  
  const user = await User.findOne({ email: 'ckumar4025@gmail.com' });
  if (user) {
    const oldWallet = await Wallet.findOne({ userId: user._id });
    if (oldWallet) {
      await Transaction.deleteMany({ walletId: oldWallet._id });
      await Wallet.deleteOne({ _id: oldWallet._id });
    }
    
    // Generate unique card details
    const cardNumber = `4123 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const currentYear = new Date().getFullYear() % 100;
    const cardExpiry = `12/${currentYear + 4}`;

    const wallet = await Wallet.create({
      userId: user._id,
      syncedBalance: 10000.0, // Genesis balance for testing
      cardNumber,
      cardExpiry
    });

    // Create a Genesis Transaction just for the record
    await Transaction.create({
      walletId: wallet._id,
      amount: 10000.0,
      type: "credit",
      title: "System Initialization",
      clientTxId: `GENESIS_${Date.now()}`,
      status: "SUCCESS",
      timestamp: new Date(),
    });
    
    return NextResponse.json({ success: true, message: "Wiped and reset Clash Ofclans" });
  }
  return NextResponse.json({ success: false, message: "User not found" });
}
