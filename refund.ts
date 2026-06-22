import connectToDatabase from './src/lib/mongoose';
import User from './src/models/User';
import Wallet from './src/models/Wallet';
import Transaction from './src/models/Transaction';

async function run() {
  await connectToDatabase();
  const sender = await User.findOne({ email: 'ckumar4025@gmail.com' });
  const receiver = await User.findOne({ email: 'kumarharsh6299961413@gmail.com' });
  
  if (sender && receiver) {
    const senderWallet = await Wallet.findOne({ userId: sender._id });
    const receiverWallet = await Wallet.findOne({ userId: receiver._id });
    
    senderWallet.syncedBalance += 150000;
    receiverWallet.syncedBalance -= 150000;
    
    await senderWallet.save();
    await receiverWallet.save();
    
    // delete the last transactions
    await Transaction.deleteMany({ amount: 150000, title: { $regex: 'harsh' } });
    
    console.log("Refunded 150,000!");
  }
  process.exit(0);
}
run();
