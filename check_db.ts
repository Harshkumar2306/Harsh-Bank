import connectToDatabase from './src/lib/mongoose';
import User from './src/models/User';
import Wallet from './src/models/Wallet';

async function run() {
  await connectToDatabase();
  const users = await User.find({});
  console.log("Users:", users.map(u => ({ email: u.email, clerkId: u.clerkId })));
  process.exit(0);
}
run();
