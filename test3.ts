import connectToDatabase from './src/lib/mongoose';
import User from './src/models/User';
import Wallet from './src/models/Wallet';
import Transaction from './src/models/Transaction';

async function run() {
  await connectToDatabase();
  
  const senderClerkId = "user_3FNLF3TYAXYK1s8a"; // The App Sync ID in the screenshot... wait, I don't know the exact ID.
  const receiverEmail = "kumarharsh6299961413@gmail.com";
  const txAmount = 150000;
  
  const sender = await User.findOne({ email: 'ckumar4025@gmail.com' });
  if (!sender) { console.log("Sender not found"); process.exit(1); }
  const senderWallet = await Wallet.findOne({ userId: sender._id });
  
  const receiver = await User.findOne({ email: receiverEmail });
  if (!receiver) { console.log("Receiver not found"); process.exit(1); }
  const receiverWallet = await Wallet.findOne({ userId: receiver._id });
  
  const timestamp = new Date();
  const clientTxId = `ONLINE_${Date.now()}`;

  try {
    senderWallet.syncedBalance -= txAmount;
    senderWallet.updatedAt = timestamp;
    await senderWallet.save();

    receiverWallet.syncedBalance += txAmount;
    receiverWallet.updatedAt = timestamp;
    await receiverWallet.save();

    await Transaction.create({
      walletId: senderWallet._id,
      amount: txAmount,
      type: 'debit',
      title: `Sent to ${receiver.name}`,
      clientTxId: clientTxId,
      status: 'SUCCESS',
      timestamp,
    });

    await Transaction.create({
      walletId: receiverWallet._id,
      amount: txAmount,
      type: 'credit',
      title: `Received from ${sender.name}`,
      clientTxId: `${clientTxId}_rx`,
      status: 'SUCCESS',
      timestamp,
    });
    
    console.log("Success!");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
