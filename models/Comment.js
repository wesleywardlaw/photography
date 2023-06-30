import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    createdAt: Number,
    commentText: String,
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: String,
    },
});

export default mongoose.modelNames().includes('Comment')
    ? mongoose.models.Comment
    : mongoose.model('Comment', CommentSchema);
