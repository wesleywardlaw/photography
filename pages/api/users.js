import nextConnect from 'next-connect';
import auth from '../../middleware/auth';
import { createUser, findUserByUsername } from '../../lib/db';
import dbConnect from '../../lib/dbConnect';

const handler = nextConnect();

handler
    .use(auth)
    .get((req, res) => {})
    .post(async (req, res) => {
        await dbConnect();
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send('Missing fields');
        }
        // Here you check if the username has already been used
        const usernameExisted = await findUserByUsername(req, username);
        if (!!usernameExisted) {
            return res.status(409).send('The username has already been used');
        }
        const user = { username, password };
        // Security-wise, you must hash the password before saving it
        // const hashedPass = await argon2.hash(password);
        // const user = { username, password: hashedPass, name }
        const result = await createUser(req, res, user);
        if (result.newUser) {
            const { newUser } = result;
            req.logIn(user, (err) => {
                if (err) throw err;
                // Log the signed up user in
                res.status(201).json({
                    user: { username: newUser.username },
                });
            });
        }
    });

export default handler;
