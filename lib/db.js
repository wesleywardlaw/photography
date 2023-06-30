import Challenge from '../models/Challenge';
import Comment from '../models/Comment';
import crypto from 'crypto';
import dbConnect from './dbConnect';
import Photo from '../models/Photo';
import User from '../models/User';

export async function deleteComment(req, res) {
    await dbConnect();
    const commentId = req.query.commentid;
    const challengeId = req.query.id;
    try {
        await Comment.findByIdAndDelete(commentId);
        await Challenge.findByIdAndUpdate(
            challengeId,
            {
                $pull: {
                    'photos.$[].comments': commentId,
                },
            },
            { new: true }
        );
    } catch (error) {
        res.status(400).json({ success: false });
    }
}

export async function deletePhoto(req, res) {
    await dbConnect();
    const id = req.query.id;
    try {
        await Photo.findByIdAndDelete(id);
    } catch (error) {
        res.status(400).json({ success: false });
    }
}

export async function deleteChallenge(req, res) {
    await dbConnect();
    const id = req.query.id;
    try {
        await Challenge.findByIdAndDelete(id);
    } catch (error) {
        res.status(400).json({ success: false });
    }
}

export async function editChallenge(req, res) {
    await dbConnect();
    const id = req.query.id;
    const title = req.body.title;
    const description = req.body.description;
    let challenge;
    try {
        challenge = await Challenge.findByIdAndUpdate(id, {
            title,
            description,
        });
    } catch (error) {
        res.status(400).json({ success: false });
    }
    return challenge;
}

export async function getChallenge(req, res) {
    await dbConnect();
    const id = req.query.id;
    let challenge;
    try {
        challenge = await Challenge.findById(id).populate({
            path: 'photos',
            populate: {
                path: 'comments',
                model: 'Comment',
            },
        });
    } catch (error) {
        res.status(400).json({ success: false });
    }
    return challenge;
}

export async function getChallenges(req, res) {
    await dbConnect();
    let challenges;
    try {
        challenges = await Challenge.find({});
    } catch (error) {
        res.status(400).json({ success: false });
    }
    return challenges;
}

export async function createUser(req, res, { username, password }) {
    await dbConnect();
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');
    const user = {
        createdAt: Date.now(),
        username,
        hash,
        salt,
        role: 'user',
    };

    let newUser;
    try {
        newUser = await User.create(user);
    } catch (error) {
        res.status(400).json({ success: false });
    }
    await newUser;
    return { newUser };
}

export async function createPhoto(filename, challengeId, req, res) {
    await dbConnect();
    const user = await req.user;
    const photo = {
        createdAt: Date.now(),
        filename,
        user: {
            id: user._id,
            username: user.username,
        },
        comments: [],
    };
    let newPhoto;
    try {
        const challenge = await Challenge.findById(challengeId);
        newPhoto = await Photo.create(photo);
        challenge.photos.push(newPhoto);
        await challenge.save();
    } catch (error) {
        res.status(400).json({ success: false });
    }
    await newPhoto;
    return { newPhoto };
}

export async function createChallenge({ title, description }, req, res) {
    await dbConnect();
    const challenge = {
        createdAt: Date.now(),
        title,
        description,
        photos: [],
    };
    let newChallenge;
    try {
        newChallenge = await Challenge.create(challenge);
    } catch (error) {
        res.status(400).json({ success: false });
    }
    await newChallenge;
    return { newChallenge };
}

export async function createComment(req, res, commentText, photoId) {
    await dbConnect();
    const user = await req.user;
    const comment = {
        createdAt: Date.now(),
        commentText,
        user: {
            id: user._id,
            username: user.username,
        },
    };
    let newComment;
    let photo;
    try {
        newComment = await Comment.create(comment);
        photo = await Photo.findById(photoId);
        photo.comments.push(newComment);
    } catch (error) {
        res.status(400).json({ success: false });
    }
    await newComment;
    await photo.save();
    return { newComment };
}
export async function findUserByUsername(req, username) {
    await dbConnect();
    const existUsername = await User.findOne({ username });
    return existUsername;
}

export function updateUserByUsername(req, username, update) {
    const user = req.session.users.find((u) => u.username === username);
    Object.assign(user, update);
    return user;
}

export function deleteUser(req, username) {
    req.session.users = req.session.users.filter(
        (user) => user.username !== req.user.username
    );
}

export function validatePassword(user, inputPassword) {
    const inputHash = crypto
        .pbkdf2Sync(inputPassword, user.salt, 1000, 64, 'sha512')
        .toString('hex');
    const passwordsMatch = user.hash === inputHash;
    return passwordsMatch;
}
