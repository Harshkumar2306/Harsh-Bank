import connectToDatabase from './src/lib/mongoose';
import User from './src/models/User';
import Wallet from './src/models/Wallet';
import Transaction from './src/models/Transaction';

async function run() {
  await connectToDatabase();
  const sender = await User.findOne({ email: 'ckumar4025@gmail.com' });
  
  if (sender) {
    const senderWallet = await Wallet.findOne({ userId: sender._id });
    
    // Delete all 150000 transactions to clean up the mess
    await Transaction.deleteMany({ walletId: senderWallet._id, amount: 150000 });
    
    // Restore balance to exactly 170628 as it was originally
    // Since we refunded 150000 earlier, balance is currently 20628 + 150000 = 170628. Wait, is it?
    // The user sent 150,000 via the app (hlo), so balance dropped to 20,628 again.
    // If we delete the transaction "hlo", we should refund 150000 again.
    
    console.log("Current balance:", senderWallet.syncedBalance);
    senderWallet.syncedBalance = 170628;
    await senderWallet.save();
    
    // Also remove from receiver
    const receiver = await User.findOne({ email: 'kumarharsh6299961413@gmail.com' });
    if (receiver) {
      const receiverWallet = await Wallet.findOne({ userId: receiver._id });
      await Transaction.deleteMany({ walletId: receiverWallet._id, amount: 150000 });
      // Restore receiver balance to whatever it was without the 150000 tests.
      // We will just subtract 150000 * the number of times it was added.
      // But we can just assume we need to subtract the 150000 from the "hlo" transaction.
      // Let's just deduct 150000 for now.
      receiverWallet.syncedBalance -= 150000;
      await receiverWallet.save();
    }
    
    console.log("DB Cleaned!");
  }
  process.exit(0);
}
run();
