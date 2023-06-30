import auth from '../../middleware/auth';
import nextConnect from 'next-connect';
import passport from '../../lib/passport';

const handler = nextConnect();

// handler.use(auth).post(passport.authenticate('local'), (req, res) => {
//     res.json({ user: req.user });
// });

handler.get((req, res) => {
    res.status(200).json({ hello: 'hi' });
});

export default handler;
