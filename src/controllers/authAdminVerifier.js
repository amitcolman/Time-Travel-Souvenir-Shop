const authAdminVerifier = (req, res, next) => {
    if (!req.session.user || !req.session.user.types.includes('admin')) {
        return res.status(403).send({status: 'Error', message: 'Access denied'});
    }
    next();
}

module.exports = authAdminVerifier;