import connectToDatabase from './src/lib/mongoose';
import User from './src/models/User';
import Wallet from './src/models/Wallet';
import Transaction from './src/models/Transaction';

async function run() {
  await connectToDatabase();
  const txs = await Transaction.find({}).sort({ timestamp: -1 }).limit(10);
  console.log("Recent TXs:", txs);
  process.exit(0);
}
run();
