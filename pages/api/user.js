import { deleteUser, createUser, updateUserByUsername } from '../../lib/db';
import { isAuthorized } from '../../middleware/isAuthenticated';
import auth from '../../middleware/auth';
import dbConnect from '../../lib/dbConnect';
import nextConnect from 'next-connect';

const handler = nextConnect();

handler
    .use(auth)
    .use(isAuthorized)
    .get(async (req, res) => {
        await dbConnect();
        const user = await req.user;
        if (user?.username) {
            res.status(200).json({
                user: { username: user?.username, role: user?.role },
            });
        } else {
            res.status(401).json({ message: 'unauthenticated' });
        }
    })
    .post((req, res) => {
        const { username, password, name } = req.body;
        createUser(req, res, { username, password, name });
        res.status(200).json({ success: true, message: 'created new user' });
    })
    .use((req, res, next) => {
        if (!req.user) {
            res.status(401).send('unauthenticated');
        } else {
            next();
        }
    })
    .put((req, res) => {
        const { name } = req.body;
        const user = updateUserByUsername(req, req.user.username, { name });
        res.json({ user });
    })
    .delete((req, res) => {
        deleteUser(req);
        req.logOut();
        res.status(204).end();
    });

export default handler;
