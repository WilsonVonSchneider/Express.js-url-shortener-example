const Url = require('../model/Url')

class UrlRepository {

    // show a list of user urls
   /*  async index(userId) {
        const urls = await Url.find({ author: userId })
        return urls;
    } */

    // show a paginated list of user URLs
    async index(userId, page, limit) {
        const skip = (page - 1) * limit;
        const count = await Url.countDocuments({ author: userId });
        const totalPages = Math.ceil(count / limit);

        const urls = await Url.find({ author: userId })
            .skip(skip)
            .limit(limit);

        return {
            urls,
            totalPages,
            currentPage: page,
            totalItems: count
        };
    }

    // add new url to DB
    async create(userId, trueUrl, shortUrl) {

        //create new url
        const url = await Url.create({
            trueUrl,
            shortUrl,
            "author": userId
        });
        return url;
    }

    // get url by short url
    async getUrlByShortUrl(shortUrl) {
        const url = await Url.findOne({ shortUrl });
        return url;
    }

    // get url by id
    async show(urlId) {
        const url = await Url.findById(urlId);
        return url;
    }

    // update user url
    async update(urlId, updatedData) {
        const updatedUrl = await Url.findByIdAndUpdate(urlId, updatedData, { new: true });
        return updatedUrl;
    }

    async delete(urlId) {
        // delete url by id
        const deltedUrl = await Url.deleteOne({ _id: urlId });
        return deltedUrl;
    }

}
module.exports = new UrlRepository();
