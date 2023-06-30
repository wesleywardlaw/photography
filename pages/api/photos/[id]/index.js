import nextConnect from 'next-connect';

import { deletePhoto } from '../../../../lib/db';
import auth from '../../../../middleware/auth';
import dbConnect from '../../../../lib/dbConnect';
import { isAuthorized } from '../../../../middleware/isAuthenticated';

const handler = nextConnect();

handler
    .use(auth)
    .use(isAuthorized)
    .get((req, res) => {})
    .post(async (req, res) => {})
    .delete(async (req, res) => {
        await dbConnect();
        const user = await req.user;
        if (user.role !== 'admin')
            return res.status(401).json({ error: 'Unauthorized' });
        await deletePhoto(req, res);
        res.status(200).json({ success: true });
    });

export default handler;
