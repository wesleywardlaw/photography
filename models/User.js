import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    createdAt: Number,
    username: String,
    hash: String,
    salt: String,
    role: String,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
