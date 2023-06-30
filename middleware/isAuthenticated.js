export const isAuthorized = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ 401: 'unauthorized' });
    }

    next();
};
