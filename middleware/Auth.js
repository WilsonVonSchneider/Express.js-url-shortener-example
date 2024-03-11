const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ 'message': "Unauthorized!" }); //Unauthorized
    const accessToken = authHeader.split(' ')[1];
    jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); //invalid token
            req.user = decoded.UserInfo.id;
            next();
        }
    );
}

module.exports = auth;