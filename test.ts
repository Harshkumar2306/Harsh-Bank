import connectToDatabase from './src/lib/mongoose';
import Wallet from './src/models/Wallet';
import Transaction from './src/models/Transaction';
import User from './src/models/User';

async function run() {
  await connectToDatabase();
  const user = await User.findOne({ email: 'ckumar4025@gmail.com' });
  if (user) {
    const wallet = await Wallet.findOne({ userId: user._id });
    console.log(wallet);
    const txs = await Transaction.find({ walletId: wallet._id });
    console.log(`Found ${txs.length} txs for user.`);
  }
  process.exit(0);
}
run();
