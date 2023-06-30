import AWS from 'aws-sdk';
import nextConnect from 'next-connect';

import { isAuthorized } from '../../../../middleware/isAuthenticated';
import auth from '../../../../middleware/auth';
import dbConnect from '../../../../lib/dbConnect';

import {
    getChallenge,
    deleteChallenge,
    editChallenge,
} from '../../../../lib/db';

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const generateSignedUrls = async (photoInfo, res) => {
    let signedURLs;
    try {
        signedURLs = await Promise.all(
            photoInfo.map(async ({ filename, id }) => {
                const params = {
                    Bucket: 'photography-4h',
                    Key: filename,
                    Expires: 3000,
                };

                const signedUrl = await s3.getSignedUrlPromise(
                    'getObject',
                    params
                );
                return { id, signedUrl };
            })
        );
        signedURLs = signedURLs.reduce((result, obj) => {
            result[obj.id.toString()] = obj.signedUrl;
            return result;
        }, {});
    } catch (error) {
        res.status(500).json({ error: 'Unable to generate signed URLs' });
    }
    return signedURLs;
};

const handler = nextConnect();

handler
    .use(auth)
    .use(isAuthorized)
    .get(async (req, res) => {
        await dbConnect();
        let challenge = await getChallenge(req, res);
        const photoInfo = challenge.photos.map((photo) => {
            return { filename: photo.filename, id: photo._id };
        });
        const photoURLs = await generateSignedUrls(photoInfo, res);
        const updatedPhotos = challenge.photos.map((photo) => {
            const photoURL = photoURLs[photo._id.toString()];
            const updatedPhoto = {
                user: photo.user,
                _id: photo._id,
                createdAt: photo.createdAt,
                filename: photo.filename,
                __v: photo.__v,
                photoURL: photoURL || '',
                comments: photo.comments,
            };

            return updatedPhoto;
        });
        const updatedChallenge = {
            title: challenge.title,
            description: challenge.description,
            photos: updatedPhotos,
        };
        res.status(200).json({ ...updatedChallenge });
    })
    .post(async (req, res) => {})
    .use((req, res, next) => {
        if (!req.user) {
            res.status(401).send('unauthenticated');
        } else {
            next();
        }
    })
    .patch(async (req, res) => {
        const challenge = await editChallenge(req, res);
        res.status(200).json(challenge);
    })
    .delete(async (req, res) => {
        const user = await req.user;
        if (user.role !== 'admin') {
            return res.status(401).send('unauthorized');
        }
        await deleteChallenge(req, res);
        res.status(200).json({ message: 'challenge deleted' });
    });

export default handler;
