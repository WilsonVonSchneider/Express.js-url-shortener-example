const { validationResult, check } = require('express-validator');
const urlService = require('../service/UrlService');

class UrlController {
    async index(req, res) {
        try {
            // get authenticated user id from req
            const userId = req.user;

            //get body with page and limit
            const body = req.body;

            // validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // There are validation errors
                return res.status(400).json({ errors: errors.array() });
            }

            // Retrieve urls based from autheticated user (by userId)
            const urls = await urlService.index(userId, body);

            // Return the urls in the response
            return res.status(200).json(urls);

        } catch (err) {
            res.status(500).json({ 'message': "oopss something went wrong!" });
        }

    }
    async create(req, res) {
        try {
            const body = req.body;

            // get authenticated user id from req
            const userId = req.user;

            // validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // There are validation errors
                return res.status(400).json({ errors: errors.array() });
            }

            // define shortUrl 
            let shortUrl;

            // if keyword is not provided create random short url
            if (!body.keyWord) {
                shortUrl = urlService.generateShortUrl();
            }
            // if keyword is provided create short url with keyword
            else {
                shortUrl = `${body.keyWord}`;
            }
            // check if generated short url exists already in db
            const urlExists = await urlService.getUrlByShortUrl(shortUrl);
            if (urlExists) return res.status(400).json({ 'message': "URL already exist, change your keyword!" });

            // if all validations are passed create new url in db
            const url = await urlService.create(userId, body, shortUrl);

            // Return the url in the response
            return res.status(200).json({ 'message': "URL created successfuly!", url });
        } catch (err) {
            res.status(500).json({ 'message': "oopss something went wrong!" });
        }

    }
    async show(req, res) {
        try {
            const urlId = req.params.urlId;

            // get authenticated user id from req
            const userId = req.user;

            // validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // There are validation errors
                return res.status(400).json({ errors: errors.array() });
            }

            // check if url exists in the DB
            const url = await urlService.show(urlId);
            if (!url) return res.status(404).json({ 'message': "Url doesn't exist!" });

            // check if returned url author and authenticated user id match
            if (url.author != userId) return res.status(401).json({ 'message': "Unauthorized!" }); //Unauthorized

            // Return the url in the response
            return res.status(200).json(url);

        } catch (err) {
            res.status(500).json({ 'message': "oopss something went wrong!" });
        }
    }

    async update(req, res) {
        try {
            const urlId = req.params.urlId;
            const updatedData = req.body;

            // get authenticated user id from req
            const userId = req.user;

            // validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // There are validation errors
                return res.status(400).json({ errors: errors.array() });
            }

            // check if url exists in the DB
            const url = await urlService.show(urlId);
            if (!url) return res.status(404).json({ 'message': "Url doesn't exist!" });

            // check if returned url author and authenticated user id match
            if (url.author != userId) return res.status(401).json({ 'message': "Unauthorized!" }); //Unauthorized
            // if keyword is  provided create short url with keyword
            if (updatedData.keyWord) {
                //check if url exist with tha keyword
                const shortUrl = `${updatedData.keyWord}`;
               
                // check if generated short url exists already in db
                const url = await urlService.getUrlByShortUrl(shortUrl);
                
                if (url) return res.status(400).json({ 'message': "URL already exist, change your keyword!" });

                updatedData.shortUrl = shortUrl;
            }

            // update URL
            const updatedUrl = await urlService.update(urlId, updatedData);

            // Return URL updated successfully
            return res.status(200).json({ 'message': "URL updated successfuly!" });
        } catch (err) {
            res.status(500).json({ 'message': "oopss something went wrong!" });
        }
    }

    async delete(req, res) {
        try {
            //get url id from params
            const urlId = req.params.urlId;
            // get authenticated user id from req
            const userId = req.user;

            // validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // There are validation errors
                return res.status(400).json({ errors: errors.array() });
            }

            // check if url exists in the DB
            const url = await urlService.show(urlId);
            if (!url) return res.status(404).json({ 'message': "Url doesn't exist!" });

            // check if returned url author and authenticated user id match
            if (url.author != userId) return res.status(401).json({ 'message': "Unauthorized!" }); //Unauthorized

            // delete URL
            await urlService.delete(urlId);

            // Return URL deleted successfully
            return res.status(200).json({ 'message': "URL deleted successfuly!" });

        } catch (err) {
            res.status(500).json({ 'message': "oopss something went wrong!" });
        }
    }

    async redirect(req, res) {
        try {
            const shortUrl = req.params.shortUrl;

            // check if short URL exists in db
            const url = await urlService.getUrlByShortUrl(shortUrl);
            if (!url) return res.status(404).json({ 'message': "URL doesn't exist!" });

            url.counter++;
            const updatedData = url;
            await urlService.update(url.id, updatedData);
            res.status(301).redirect(url.trueUrl);

        } catch (err) {
            res.status(500).json({ 'message': "oopss something went wrong!" });
        }
    }
}

module.exports = new UrlController();