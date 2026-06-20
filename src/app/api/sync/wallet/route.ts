import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Wallet from '@/models/Wallet';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { appSyncId } = body;

    if (!appSyncId) {
      return NextResponse.json({ error: 'Missing appSyncId' }, { status: 400 });
    }

    // appSyncId is actually the user's clerkId
    const user = await User.findOne({ clerkId: appSyncId });
    if (!user) {
      return NextResponse.json({ error: 'Invalid App Sync ID' }, { status: 404 });
    }

    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        syncedBalance: wallet.syncedBalance,
        appSyncId: user.clerkId
      }
    });

  } catch (error: any) {
    console.error("Wallet Sync API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
