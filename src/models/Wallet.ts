import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  syncedBalance: number;
  cardNumber: string;
  cardExpiry: string;
  currency: string;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  syncedBalance: { type: Number, default: 0.0 },
  cardNumber: { type: String, required: true },
  cardExpiry: { type: String, required: true },
  currency: { type: String, default: 'INR' },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);
