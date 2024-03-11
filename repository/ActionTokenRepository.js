const ActionToken = require('../model/ActionToken')

class ActionTokenRepository {

    //add new action token to DB
    async create(userId) {

        //create new action token
        const actionToken = await ActionToken.create({
            "entity_id": userId,
            "action_name": 'verify email'
        });
        return actionToken; 
    }

    //get user by id
    async show(actionTokenId) {
        // find user by id
        const actionToken = await ActionToken.findById(actionTokenId);
        return actionToken;
    }

    //update actionToken
    async update(updatedData, actionTokenId) {
        // unpack updated data
        const { actionTokenExecutedAt } = updatedData;
        
        // find action token by id
        const actionToken = await ActionToken.findById(actionTokenId);
        
        //assing updated data if exists
        actionToken.executed_at = actionTokenExecutedAt || actionToken.executed_at;

        //update action token with updated data
        const updatedActionToken = await actionToken.save();
        return updatedActionToken;
    }
}
module.exports = new ActionTokenRepository();
