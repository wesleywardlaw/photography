import { deleteComment } from '../../../../../../lib/db';
import { isAuthorized } from '../../../../../../middleware/isAuthenticated';
import auth from '../../../../../../middleware/auth';
import dbConnect from '../../../../../../lib/dbConnect';
import nextConnect from 'next-connect';

const handler = nextConnect();

handler
    .use(auth)
    .use(isAuthorized)
    .get((req, res) => {})
    .post(async (req, res) => {})
    .delete(async (req, res) => {
        await dbConnect();
        const user = await req.user;
        if (user.role !== 'admin') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        await deleteComment(req, res);
        res.status(200).json({ success: true });
    });

export default handler;
