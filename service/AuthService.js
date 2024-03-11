const userRepository = require('../repository/UserRepository');
const actionTokenRepository = require('../repository/ActionTokenRepository');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');

class AuthService {

    //add new user to DB
    async create(body) {

        //unpack body parameters
        const { username, email, password } = body;

        //encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userRepository.create(username, email, hashedPassword);

        return user;
    }

    //get user by username
    async getUserByUsername(username) {
        const user = userRepository.getUserByUsername(username);
        return user;
    }
    //get user by email
    async getUserByEmail(email) {
        const user = userRepository.getUserByEmail(email);
        return user;
    }

    //get user by refresh token
    async getUserByRefreshToken(refreshToken) {
        const user = userRepository.getUserByRefreshToken(refreshToken);
        return user;
    }

    // get user by id
    getUserById(userId){
        const user = userRepository.show(userId);
        return user;
    }

    async createAccessToken(userId) {

        //create acces token
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "id": userId
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '120s' }
        );
        return accessToken;
    }

    //create refresh token
    async createRefreshToken(userId) {

        //create refresh token
        const refreshToken = jwt.sign(
            { "id": userId },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        return refreshToken;
    }

    async updateUser(updateData, userId) {
        const user = userRepository.update(updateData, userId);
        return user;
    }

    async updateActionToken(updateData, actionTokenId) {
        const actionToken = actionTokenRepository.update(updateData, actionTokenId);
        return actionToken;
    }

    async sendVerificationEmail(email, actionTokenId) {

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_ETHERAL_USER, // generated ethereal user
                pass: process.env.EMAIL_ETHERAL_PASS, // generated ethereal password
            },
        });

        // send mail with defined transport object
        const msg = {
            from: '"Express url shortener app" <expressApp@shortener.com>', // sender address
            to: `${email}`, // list of receivers
            subject: "Express url shortener app: Verify your email", // Subject line
            text: `link: ${process.env.HOST}/auth/verify-email/${actionTokenId}`, // plain text body
            html: `<a href="${process.env.HOST}/auth/verify-email/${actionTokenId}">Click here to verify your email</a>`
        };

        let info = await transporter.sendMail(msg);

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

    }

    async createActionToken(userId){

        const actionToken = await actionTokenRepository.create(userId);

        return actionToken;
    }
    
    async getActionTokenById(actionTokenId){
        const actionToken = actionTokenRepository.show(actionTokenId);
        return actionToken;
    }
}
module.exports = new AuthService();