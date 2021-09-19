const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');

const Users = require('../models/Users');

const auth = async (req, res, next) => {

    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!(authHeader && authHeader.startsWith('Bearer '))) {
        return res.status(403).send('A token is required for authentication.');
    }

    const token = authHeader.substring(7, authHeader.length);

    let decoded;
    try {
        decoded = jwt.verify(token, jwtConfig.key);
    } catch (e) {
        return res.status(401).send('Invalid token.');
    }

    // TODO: use projection
    try {
        const clientUser = await Users.findById(decoded.userId).exec();
        if (clientUser && clientUser.admin === decoded.admin) {
            req.user = clientUser;
        } else {
            return res.status(401).send('Cannot verify user.');
        }
    } catch (e) {
        return res.status(401).send('Cannot verify your credentials.');
    }

    return next();
}

module.exports = auth;
