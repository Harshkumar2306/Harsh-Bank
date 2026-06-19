import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  walletId: mongoose.Types.ObjectId;
  amount: number;
  type: 'credit' | 'debit';
  title: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  clientTxId: string; // The txId generated on the mobile app
  senderId?: string; // Clerk ID of sender
  receiverId?: string; // Clerk ID of receiver
  timestamp: Date;
}

const TransactionSchema: Schema = new Schema({
  walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'SUCCESS' },
  clientTxId: { type: String, required: true, unique: true },
  senderId: { type: String },
  receiverId: { type: String },
  timestamp: { type: Date, required: true },
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
