import { findUserByUsername, validatePassword } from './db';
import dbConnect from './dbConnect';
import LocalStrategy from 'passport-local';
import passport from 'passport';

passport.serializeUser(function (user, done) {
    // serialize the username into session
    done(null, user.username);
});

passport.deserializeUser(async function (req, id, done) {
    // deserialize the username back into user object
    await dbConnect();
    const user = findUserByUsername(req, id);
    done(null, user);
});

passport.use(
    new LocalStrategy(
        { passReqToCallback: true },
        async (req, username, password, done) => {
            // Here you lookup the user in your DB and compare the password/hashed password
            await dbConnect();
            const user = await findUserByUsername(req, username);
            // Security-wise, if you hashed the password earlier, you must verify it
            // if (!user || await argon2.verify(user.password, password))
            if (!user || !validatePassword(user, password)) {
                done(null, null);
            } else {
                done(null, user);
            }
        }
    )
);

export default passport;
