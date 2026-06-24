import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Wallet from '@/models/Wallet';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { clerkId, amount, direction } = body;

    if (!clerkId || amount === undefined || !direction) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Direction: "to_offline" moves funds from syncedBalance -> lockedOfflineBalance
    // Direction: "to_online" moves funds from lockedOfflineBalance -> syncedBalance
    if (direction === 'to_offline') {
      if (wallet.syncedBalance < amount) {
        return NextResponse.json({ error: 'Insufficient main cloud balance' }, { status: 400 });
      }
      wallet.syncedBalance -= amount;
      wallet.lockedOfflineBalance += amount;
    } else if (direction === 'to_online') {
      if (wallet.lockedOfflineBalance < amount) {
        return NextResponse.json({ error: 'Insufficient offline vault balance' }, { status: 400 });
      }
      wallet.lockedOfflineBalance -= amount;
      wallet.syncedBalance += amount;
    } else {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
    }

    await wallet.save();

    return NextResponse.json({
      success: true,
      data: {
        syncedBalance: wallet.syncedBalance,
        lockedOfflineBalance: wallet.lockedOfflineBalance,
      }
    });

  } catch (error: any) {
    console.error("Transfer Offline API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
