import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb+srv://harshkumar6299961413:B1n4Z7Ww8r8DqS34@cluster0.k26yq.mongodb.net/harsh_bank?retryWrites=true&w=majority');
  
  const db = mongoose.connection.db;
  if (!db) {
    console.log("No DB");
    process.exit(1);
  }
  
  const users = await db.collection('users').find({ email: 'ckumar4025@gmail.com' }).toArray();
  console.log("Users:", users.length);
  for (const u of users) {
    const wallets = await db.collection('wallets').find({ userId: u._id }).toArray();
    console.log("Wallets:", wallets.length);
    for (const w of wallets) {
      console.log("Wallet Balance:", w.syncedBalance);
      const txs = await db.collection('transactions').find({ walletId: w._id }).toArray();
      console.log(`Found ${txs.length} txs for this wallet.`);
    }
  }
  
  process.exit(0);
}
run();
