const User = require('../model/User')

class UserRepository {

    //add new user to DB
    async create(username, email, hashedPassword) {

        //create new user
        const user = await User.create({
            username,
            email,
            "password": hashedPassword
        });
        return user; 
    }

    //get user by username
    async getUserByUsername(username) {
        const user = await User.findOne({ username: username });
        return user;
    }
    //get user by email
    async getUserByEmail(email) {
        const user = await User.findOne({ email: email });
        return user;
    }
    //get user by refresh token
    async getUserByRefreshToken(refreshToken) {
        const user = await User.findOne({ refreshToken: refreshToken });
        return user;
    }
     //get user by id
     async show(userId) {
        // find user by id
        const user = await User.findById(userId);
        return user;
    }

    //update user
    async update(updatedData, userId) {
        // update user 
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        return updatedUser;
    }
}
module.exports = new UserRepository();
