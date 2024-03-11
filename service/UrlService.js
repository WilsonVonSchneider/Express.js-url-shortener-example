const urlRepository = require('../repository/UrlRepository');
const crypto = require('crypto');

class UrlService {

    async index(userId, body) {
        //unpack body parameters, make sure if page or limit are not sent to set default value
        const page = body.page || process.env.PAGINATION_DEFAULT_PAGE;
        const limit = body.limit || process.env.PAGINATION_DEFAULT_PER_PAGE;
        const urls = await urlRepository.index(userId, page, limit);
        return urls;
    }

    generateShortUrl() {
        // Generate a random 8-character string for the short URL
        const randomBytes = crypto.randomBytes(4);
        const randomNumbers = randomBytes.toString('hex').substring(0, 8);
        const shortUrl = `${randomNumbers}`;

        return shortUrl;
    }

    async create(userId, body, shortUrl) {
        //unpack body
        const trueUrl = body.trueUrl;
        const url = await urlRepository.create(userId, trueUrl, shortUrl);
        return url;
    }

    async getUrlByShortUrl(shortUrl) {
        const url = await urlRepository.getUrlByShortUrl(shortUrl);
        return url;
    }

    async show(urlId) {
        const url = await urlRepository.show(urlId);
        return url;
    }

    async update(urlId, updatedData) {
        const updatedUrl = await urlRepository.update(urlId, updatedData);
        return updatedUrl;
    }

    async delete(urlId) {
        const deletedUrl = await urlRepository.delete(urlId);
        return deletedUrl;
    }


}
module.exports = new UrlService();