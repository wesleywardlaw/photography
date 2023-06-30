import nextConnect from 'next-connect';

import { createChallenge, getChallenges } from '../../../lib/db';
import { isAuthorized } from '../../../middleware/isAuthenticated';
import auth from '../../../middleware/auth';
import dbConnect from '../../../lib/dbConnect';

const handler = nextConnect();

handler
    .use(auth)
    .use(isAuthorized)
    .get(async (req, res) => {
        await dbConnect();
        const challenges = await getChallenges(req, res);
        res.status(200).json(challenges);
    })
    .post(async (req, res) => {
        const challenge = {
            title: req.body.title,
            description: req.body.description,
        };
        await dbConnect();
        const result = await createChallenge(challenge, req, res);
        if (result.newChallenge) {
            const { newChallenge } = result;
            res.status(201).json({ newChallenge });
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
