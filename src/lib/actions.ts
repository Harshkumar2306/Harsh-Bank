"use server";

import connectToDatabase from "./mongoose";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import { currentUser } from "@clerk/nextjs/server";

export async function syncUserAndGetWallet() {
  await connectToDatabase();
  
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return { error: "Not logged in" };
  }

  const clerkId = clerkUser.id;
  const email = clerkUser.emailAddresses[0]?.emailAddress || "";
  const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User";

  // 1. Find or create the User
  let user = await User.findOne({ clerkId });
  if (!user) {
    user = await User.create({
      clerkId,
      name,
      email,
    });
  }

  // 2. Find or create the Wallet
  let wallet = await Wallet.findOne({ userId: user._id });
  if (!wallet) {
    // Generate unique card details
    const cardNumber = `4123 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const currentYear = new Date().getFullYear() % 100;
    const cardExpiry = `12/${currentYear + 4}`;

    wallet = await Wallet.create({
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
  }

  // Retrofit existing wallets that don't have a card number
  if (!wallet.cardNumber) {
    const cardNumber = `4123 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const currentYear = new Date().getFullYear() % 100;
    const cardExpiry = `12/${currentYear + 4}`;
    
    // Use updateOne to bypass strict validation issues just in case
    await Wallet.updateOne(
      { _id: wallet._id },
      { $set: { cardNumber, cardExpiry } }
    );
    
    // Re-fetch the wallet from the database so Mongoose serializes it correctly
    wallet = await Wallet.findOne({ userId: user._id });
  }

  // 3. Fetch recent transactions
  const transactions = await Transaction.find({ walletId: wallet._id })
    .sort({ timestamp: -1 })
    .limit(20)
    .lean();

  return {
    wallet: JSON.parse(JSON.stringify(wallet)),
    transactions: JSON.parse(JSON.stringify(transactions)),
    clerkId: clerkId,
    name: user.name,
    email: user.email
  };
}

// Deposit Virtual Funds
export async function depositFunds(amount: number) {
  await connectToDatabase();
  
  const clerkUser = await currentUser();
  if (!clerkUser) return { error: "Not logged in" };

  const user = await User.findOne({ clerkId: clerkUser.id });
  if (!user) return { error: "User not found" };

  const wallet = await Wallet.findOne({ userId: user._id });
  if (!wallet) return { error: "Wallet not found" };

  wallet.syncedBalance += amount;
  wallet.updatedAt = new Date();
  await wallet.save();

  await Transaction.create({
    walletId: wallet._id,
    amount: amount,
    type: "credit",
    title: "Virtual ATM Deposit",
    clientTxId: `DEP_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    status: "SUCCESS",
    timestamp: new Date(),
  });

  return { success: true, newBalance: wallet.syncedBalance };
}

// Online P2P Transfer
export async function transferFundsOnline(recipientEmail: string, amount: number) {
  await connectToDatabase();
  
  if (amount <= 0) return { error: "Invalid amount" };

  const clerkUser = await currentUser();
  if (!clerkUser) return { error: "Not logged in" };

  // Find Sender
  const sender = await User.findOne({ clerkId: clerkUser.id });
  if (!sender) return { error: "Sender not found" };

  if (sender.email === recipientEmail) {
    return { error: "Cannot transfer to yourself" };
  }

  // Find Recipient
  const recipient = await User.findOne({ email: recipientEmail });
  if (!recipient) return { error: "Recipient email not found in Harsh Bank network" };

  const senderWallet = await Wallet.findOne({ userId: sender._id });
  const recipientWallet = await Wallet.findOne({ userId: recipient._id });

  if (!senderWallet || !recipientWallet) return { error: "Wallet lookup failed" };

  if (senderWallet.syncedBalance < amount) {
    return { error: "Insufficient central funds" };
  }

  // Deduct from Sender
  senderWallet.syncedBalance -= amount;
  await senderWallet.save();

  await Transaction.create({
    walletId: senderWallet._id,
    amount: amount,
    type: "debit",
    title: `Transfer to ${recipient.name}`,
    clientTxId: `TX_OUT_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    receiverId: recipient.clerkId,
    status: "SUCCESS",
    timestamp: new Date(),
  });

  // Add to Recipient
  recipientWallet.syncedBalance += amount;
  await recipientWallet.save();

  await Transaction.create({
    walletId: recipientWallet._id,
    amount: amount,
    type: "credit",
    title: `Transfer from ${sender.name}`,
    clientTxId: `TX_IN_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    senderId: sender.clerkId,
    status: "SUCCESS",
    timestamp: new Date(),
  });

  return { success: true };
}
