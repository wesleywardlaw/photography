import { createComment } from '../../../../../lib/db';
import dbConnect from '../../../../../lib/dbConnect';
import nextConnect from 'next-connect';

import { isAuthorized } from '../../../../../middleware/isAuthenticated';
import auth from '../../../../../middleware/auth';

const handler = nextConnect();

handler
    .use(auth)
    .use(isAuthorized)
    .get(async (req, res) => {
        await dbConnect();
    })
    .post(async (req, res) => {
        await dbConnect();
        const commentText = req.body.comment;
        const photoId = req.body.photo;
        const comment = await createComment(req, res, commentText, photoId);
        if (comment) {
            res.status(200).json({ comment: comment.newComment });
        }
    })
    .use((req, res, next) => {
        if (!req.user) {
            res.status(401).send('unauthenticated');
        } else {
            next();
        }
    })
    .put((req, res) => {})
    .delete((req, res) => {});

export default handler;
