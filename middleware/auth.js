import nextConnect from 'next-connect';
import passport from '../lib/passport';
import session from '../lib/session';

const auth = nextConnect()
    .use(
        session({
            name: 'sess',
            secret: process.env.TOKEN_SECRET,
            cookie: {
                maxAge: 30*1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                sameSite: 'lax',
            },
        })
    )
    .use((req, res, next) => {
        console.log('Session ID:', req);
      })
    .use(passport.initialize())
    .use(passport.session());

export default auth;
