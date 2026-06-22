import connectToDatabase from './src/lib/mongoose';
import User from './src/models/User';
import Wallet from './src/models/Wallet';

async function run() {
  await connectToDatabase();
  const receiver = await User.findOne({ email: 'kumarharsh6299961413@gmail.com' });
  if (receiver) {
    const receiverWallet = await Wallet.findOne({ userId: receiver._id });
    console.log("Receiver Wallet:", receiverWallet);
  } else {
    console.log("Receiver not found");
  }
  process.exit(0);
}
run();
