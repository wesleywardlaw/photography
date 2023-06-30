import mongoose from 'mongoose';

const ChallengeSchema = new mongoose.Schema({
    createdAt: Number,
    title: String,
    description: String,
    photos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Photo',
        },
    ],
});

export default mongoose.models.Challenge ||
    mongoose.model('Challenge', ChallengeSchema);
