const { validationResult, check } = require('express-validator');
const authService = require('../service/AuthService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {

    async create(req, res) {
        try {
            const body = req.body;

            // validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // There are validation errors
                return res.status(400).json({ errors: errors.array() });
            }

            // check for duplicate usernames in the db
            const usernameExists = await authService.getUserByUsername(body.username);
            if (usernameExists) return res.status(409).json({ 'message': "username already exists" }); //Conflict 

            // check for duplicate emails in the db
            const emailExists = await authService.getUserByEmail(body.email);
            if (emailExists) return res.status(409).json({ 'message': "email already exists" }); //Conflict 

            //create and store the new user
            const user = await authService.create(body);

            //create new action token
            const actionToken = await authService.createActionToken(user.id);

            //send an verification email
            await authService.sendVerificationEmail(user.email, actionToken.id);

            //return status 200 OK
            res.status(200).json({ 'success': `New user created!` });
        } catch (err) {
            res.status(500).json({ 'message': "oopss something went wrong!" });
        }
    }

    async login(req, res) {
        try {
            const body = req.body;

            // validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // There are validation errors
                return res.status(400).json({ errors: errors.array() });
            }

            // check for user exists in db
            const user = await authService.getUserByEmail(body.email);
            if (!user) return res.status(401).json({ 'message': "Wrong credentials!" }); //Unauthorized

            //check the password
            const correctPassword = await bcrypt.compare(body.password, user.password);
            if (!correctPassword) return res.status(401).json({ 'message': "Wrong credentials!" }); //Unauthorized

            // check if email is verified.
            if (!user.emailVerifiedAt) return res.status(401).json({ 'message': "Email not verified!" }); //Unauthorized 

            // create JWTs
            const accessToken = await authService.createAccessToken(user.id);
            const refreshToken = await authService.createRefreshToken(user.id);

            // saving refresh token with user in DB
            const updateData = { refreshToken };
            const userId = user.id;
            await authService.updateUser(updateData, userId);

            // write refreshToken into cookie
            res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: false, maxAge: 24 * 60 * 60 * 1000 });
            // return accessToken as a response
            res.json({ accessToken });
        } catch (err) {
            res.status(500).json({ 'message': "oopss something went wrong!" });
        }
    }

    async logout(req, res) {
        try {
            const cookie = req.cookies;

            // check if cookie exists
            if(!cookie.jwt) return res.status(401).json({ 'message': "Unoauthorized" }); //Unauthorized

            //check if user exists
            const user = await authService.getUserByRefreshToken(cookie.jwt);
            if (!user) return res.status(500).json({ message: "Something went wrong!" });

            // saving refresh token and email verified with user in DB
            const refreshToken = null;
            const updateDataUser = { refreshToken };
            await authService.updateUser(updateDataUser, user.id);

            // delete the cookie
        res.clearCookie('jwt');

           //return status 200 OK
           res.status(200).json({ 'success': `User logged out!` });
        } catch (err) {
            console.log(err);
            res.status(500).json({ 'message': "oopss something went wrong!" });
        }
    }

    async refreshToken(req, res) {

        // get cookies from request
        const cookies = req.cookies;
        // check if cookies contain jwt. if not throw an unauthorized error with message
        if (!cookies?.jwt) return res.status(401).json({ 'message': "Unauthorized!" }); //Unauthorized
        // if cookies contain jwt 
        const refreshToken = cookies.jwt;

        // check if there is a user with recieved refresh token in DB
        const user = await authService.getUserByRefreshToken(refreshToken);
        // if user doesnt exist return forbidden
        if (!user) return res.sendStatus(403); //Forbidden 
        // evaluate jwt 
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                //if there is a problem with token return forbidden
                if (err || user.id !== decoded.id) return res.sendStatus(403);
                const accessToken = await authService.createAccessToken(user.id);
                res.json({ accessToken })
            }
        );
    }

    async verifyEmail(req, res) {
        try {
            const actionTokenId = req.params.actionTokenId;
            const executionTime = new Date();

            // check if action token exists. If no return 404
            const actionTokenExists = await authService.getActionTokenById(actionTokenId);
            if (!actionTokenExists) return res.status(403).json({ message: "Can't verify your email. Try again or resend verification email!" });

            // check if action token has already been executed
            if (actionTokenExists.executed_at) return res.status(403).json({ message: "Can't verify your email because the verification link has already been used! Resend the verification email." });

            // check if action token is expired
            if (actionTokenExists.expires_at.getTime() < executionTime.getTime()) {
                return res.status(403).json({ message: "Can't verify your email because the verification link has expired. Resend the verification email!" });
            }

            // check if user exists by entityId
            const user = await authService.getUserById(actionTokenExists.entity_id);
            if (!user) return res.status(500).json({ message: "Something went wrong! Resend the verification email." });

            //check if user email is already verified
            if (user.emailVerifiedAt) return res.status(403).json({ message: "Email is already verified!" });

            // If all checks passed we need to update user.email_verified in user table and we need to update actionToken.executed_at in ActionToken table. 
            //We need to login the user!

            // create JWTs
            const accessToken = await authService.createAccessToken(user.id);
            const refreshToken = await authService.createRefreshToken(user.id);

            //create date for email verified
            const emailVerifiedAt = executionTime;

            // saving refresh token and email verified with user in DB
            const updateDataUser = { refreshToken, emailVerifiedAt };
            const userId = user.id;
            await authService.updateUser(updateDataUser, userId);

            //updating action token executed_at
            const actionTokenExecutedAt = executionTime;
            const updateDataToken = { actionTokenExecutedAt };
            const actionToken = await authService.updateActionToken(updateDataToken, actionTokenId);

            // write refreshToken into cookie
            res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: false, maxAge: 24 * 60 * 60 * 1000 });
            // return accessToken as a response
            res.json({ accessToken });

        } catch (err) {
            console.log(err);
            res.status(500).json({ 'message': "oopss something went wrong!" });
        }
    }

    async resendVerificationEmail(req, res) {
        try {
            const body = req.body;

            // validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // There are validation errors
                return res.status(400).json({ errors: errors.array() });
            }

            // check for user exists in db
            const user = await authService.getUserByEmail(body.email);
            if (!user) return res.status(401).json({ message: "Wrong email!" }); //Unauthorized

            //check if user email is already verified
            if (user.emailVerifiedAt) return res.status(403).json({ message: "Email is already verified!" });

            //create new action token
            const actionToken = await authService.createActionToken(user.id);

            //send an verification email
            await authService.sendVerificationEmail(user.email, actionToken.id);

            //return status 200 OK
            res.status(200).json({ 'success': `New verification mail sent!` });

        } catch (err) {
            res.status(500).json({ 'message': "oopss something went wrong!" });
        }
    }
}

module.exports = new AuthController();