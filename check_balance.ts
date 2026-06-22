import connectToDatabase from './src/lib/mongoose';
import User from './src/models/User';
import Wallet from './src/models/Wallet';

async function run() {
  await connectToDatabase();
  const sender = await User.findOne({ email: 'ckumar4025@gmail.com' });
  if (sender) {
    const senderWallet = await Wallet.findOne({ userId: sender._id });
    console.log("Sender Wallet Balance:", senderWallet.syncedBalance);
  } else {
    console.log("Sender not found");
  }
  process.exit(0);
}
run();
