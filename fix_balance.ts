import connectToDatabase from './src/lib/mongoose';
import User from './src/models/User';
import Wallet from './src/models/Wallet';
import Transaction from './src/models/Transaction';

async function run() {
  await connectToDatabase();
  const receiver = await User.findOne({ email: 'kumarharsh6299961413@gmail.com' });
  const receiverWallet = await Wallet.findOne({ userId: receiver._id });
  
  // Calculate correct balance based on transactions
  const txs = await Transaction.find({ walletId: receiverWallet._id });
  let expectedBalance = 0;
  for (const tx of txs) {
    if (tx.type === 'credit') expectedBalance += tx.amount;
    else if (tx.type === 'debit') expectedBalance -= tx.amount;
  }
  
  console.log("Current Balance:", receiverWallet.syncedBalance);
  console.log("Expected Balance based on TXs:", expectedBalance);
  
  // Fix the balance
  receiverWallet.syncedBalance = expectedBalance;
  await receiverWallet.save();
  console.log("Fixed balance to:", expectedBalance);
  
  process.exit(0);
}
run();
