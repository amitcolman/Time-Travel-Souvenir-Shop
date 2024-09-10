const authUserVerifier = (req, res, next) => {
    if (!req.session.user) {
        return res.status(403).send({status: 'Error', message: 'Access denied: User not logged in'});
    }
    next();
}

module.exports = authUserVerifier;