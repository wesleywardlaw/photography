import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
    createdAt: Number,
    filename: String,
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: String,
    },
    photoURL: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
    ],
});

export default mongoose.modelNames().includes('Photo')
    ? mongoose.models.Photo
    : mongoose.model('Photo', PhotoSchema);
