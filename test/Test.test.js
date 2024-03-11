const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../model/User');
const Url = require('../model/Url');
const ActionToken = require('../model/ActionToken')
const app = require('../testEnviroment/test-index'); // this is the file where you define your app and routes

// Create a new instance of the in-memory Mongo server
const mongoServer = new MongoMemoryServer();

beforeAll(async () => {
    await mongoServer.start();

    // Wait for a short delay to ensure the server is running
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get the connection string of the in-memory database
    const mongoUri = mongoServer.getUri();

    // Check if mongoose is already connected
    if (mongoose.connection.readyState === 0) {
        // Connect to the in-memory database
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
});


afterAll(async () => {
    // Disconnect Mongoose and stop the in-memory database
    await mongoose.disconnect();
    await mongoServer.stop();
});

test('Create a new user', async () => {
    // Create a mock user object
    const mockUser = {
        username: 'natalia',
        email: 'natalia@mail.mail',
        password: '123456',
    };

    // Make a POST request to create a new user
    const response = await request(app)
        .post('/auth/register')
        .send(mockUser);

    // Assert
    // Expect that the response status is 201 (created)
    expect(response.status).toBe(200);
    expect(response.body.success).toBe("New user created!");

    // Retrieve the created user from the database using Mongoose
    const createdUser = await User.findOne({ email: mockUser.email });

    // Expect that the user exists in the database
    expect(createdUser).toBeDefined();
    // Expect that refresh token is generated
    expect(createdUser.refreshToken).toBeDefined();
    // Expect that created user has expected username
    expect(createdUser.username).toBe(mockUser.username);
    // Expect that created user has email as expected
    expect(createdUser.email).toBe(mockUser.email);

    // You can also store the created user's ID for further tests or cleanup
    const createdUserId = createdUser.id;
});

test('Create a new user: username already exists', async () => {
    // Create a mock user object
    const mockUser = {
        username: 'natalia',
        email: 'natalia@mail.mail',
        password: '123456',
    };

    // Create a mock user object
    const mockSecondUser = {
        username: 'natalia',
        email: 'natalia@mail.mail',
        password: '123456',
    };

    // Make a POST request to create a new user
    await request(app)
        .post('/auth/register')
        .send(mockUser);

    // Make a POST request to create a new user
    const response = await request(app)
        .post('/auth/register')
        .send(mockSecondUser);

    // Assert
    // Expect that the response status is 400
    expect(response.status).toBe(409);
    expect(response.body.message).toBe("username already exists");
});

test('Create a new user: email already exists', async () => {
    // Create a mock user object
    const mockUser = {
        username: 'natalia',
        email: 'natalia@mail.mail',
        password: '123456',
    };

    // Create a mock user object
    const mockSecondUser = {
        username: 'natalia2',
        email: 'natalia@mail.mail',
        password: '123456',
    };

    // Make a POST request to create a new user
    await request(app)
        .post('/auth/register')
        .send(mockUser);

    // Make a POST request to create a new user
    const response = await request(app)
        .post('/auth/register')
        .send(mockSecondUser);

    // Assert
    // Expect that the response status is 400
    expect(response.status).toBe(409);
    expect(response.body.message).toBe("email already exists");
});

test('Validation for user create: user password must be at least 6 characters long', async () => {
    // Create a mock user object
    const mockUser = {
        username: 'natalia',
        email: 'natalia@mail.mail',
        password: '123',
    };

    // Make a POST request to create a new user
    const response = await request(app)
        .post('/auth/register')
        .send(mockUser);

    // Assert
    // Expect that the response status is 400
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe("Password must be at least 6 characters long");
});

test('Validation for user create: user first name must exist', async () => {
    // Create a mock user object
    const mockUser = {
        username: '',
        email: 'natalia@mail.mail',
        password: '123456',
    };
    // Make a POST request to create a new user
    const response = await request(app)
        .post('/auth/register')
        .send(mockUser);
    // Assert
    // Expect that the response status is 400
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe("Username is required");
});

test('Validation for user create: user email must exist/be valid email', async () => {
    // Create a mock user object
    const mockUser = {
        username: 'natalia',
        email: 'natalia',
        password: '123456',
    };
    /// Make a POST request to create a new user
    const response = await request(app)
        .post('/auth/register')
        .send(mockUser);
    // Assert
    // Expect that the response status is 400
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe("Invalid email address");
});

test('Login user: user email doesnt exist in DB', async () => {
    // Create a mock user object
    const mockUser = {
        email: 'natalia@natalia.com',
        password: '123456',
    };
    /// Make a POST request to create a new user
    const response = await request(app)
        .post('/auth/login')
        .send(mockUser);
    // Assert
    // Expect that the response status is 400
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Wrong credentials!");
});

test('Login user: wrong password', async () => {
    // Create a mock user object
    const mockUser = {
        username: 'boco',
        email: 'boco@boco.com',
        password: '123456',
    };
    const mockWrongPasswordUser = {
        email: 'boco@boco.com',
        password: '654321',
    };

    // Make a POST request to create a new user
    const responseRegister = await request(app)
        .post('/auth/register')
        .send(mockUser);

    // Assert
    // Expect that the response status is 201 (created)
    expect(responseRegister.status).toBe(200);
    expect(responseRegister.body.success).toBe("New user created!");

    /// Make a POST request to create a new user
    const response = await request(app)
        .post('/auth/login')
        .send(mockWrongPasswordUser);
    // Assert
    // Expect that the response status is 400
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Wrong credentials!");
});

test('Login user: email is not verified', async () => {
    // Create a mock user object
    const mockUser = {
        username: 'test',
        email: 'test@test.com',
        password: '123456',
    };
    const mockWrongPasswordUser = {
        email: 'test@test.com',
        password: '123456',
    };

    // Make a POST request to create a new user
    const responseRegister = await request(app)
        .post('/auth/register')
        .send(mockUser);

    // Assert
    // Expect that the response status is 201 (created)
    expect(responseRegister.status).toBe(200);
    expect(responseRegister.body.success).toBe("New user created!");

    /// Make a POST request to create a new user
    const response = await request(app)
        .post('/auth/login')
        .send(mockWrongPasswordUser);
    // Assert
    // Expect that the response status is 400
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Email not verified!");
});

test('Login user', async () => {
    // Create a mock user object
    const mockUser = {
        username: 'benjo',
        email: 'benjo@test.com',
        password: '123456'
    };

    // Make a POST request to create a new user
    const responseRegister = await request(app)
        .post('/auth/register')
        .send(mockUser);

    // Assert
    // Expect that the response status is 200 (created)
    expect(responseRegister.status).toBe(200);
    expect(responseRegister.body.success).toBe("New user created!");

    // Retrieve the created user from the database using Mongoose
    const createdUser = await User.findOne({ email: mockUser.email });

    // Retrieve taction token
    const actionToken = await ActionToken.findOne({ entity_id: createdUser.id });

    // Make a request to verify email
    const responseVerifyEmail = await request(app)
        .get(`/auth/verify-email/${actionToken.id}`);

    // Assert
    // Expect that the response status is 200
    expect(responseVerifyEmail.status).toBe(200);
    expect(responseVerifyEmail.body.accessToken).toBeDefined();

    // Make a POST request to log in
    const response = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();

    // Retrieve the created user from the database using Mongoose
    const loggedUser = await User.findOne({ email: mockUser.email });

    // Assert that refresh token is created
    expect(loggedUser.refreshToken).toBeDefined();
});

test('Refresh token unauthorized', async () => {
    /// Make a POST request to create a new user
    const response = await request(app)
        .get('/auth/refresh')
    // Assert
    // Expect that the response status is 401
    expect(response.status).toBe(401);
});

test('Validation for login: user email must exist/be valid email', async () => {
    // Create a mock user object
    const mockUser = {
        email: 'natalia',
        password: '123456',
    };
    /// Make a POST request to create a new user
    const response = await request(app)
        .post('/auth/login')
        .send(mockUser);
    // Assert
    // Expect that the response status is 400
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe("Invalid email address");
});

test('Validation for login: user password must be at least 6 characters long', async () => {
    // Create a mock user object
    const mockUser = {
        email: 'natalia@natalia.com',
        password: '',
    };
    /// Make a POST request to create a new user
    const response = await request(app)
        .post('/auth/login')
        .send(mockUser);
    // Assert
    // Expect that the response status is 400
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe("Password must be at least 6 characters long");
});

test('Resend verification email: email already verified', async () => {
    // Create a mock user object
    const mockUser = {
        username: 'benjo1',
        email: 'benjo1@test.com',
        password: '123456'
    };

    // Make a POST request to create a new user
    const responseRegister = await request(app)
        .post('/auth/register')
        .send(mockUser);

    // Assert
    // Expect that the response status is 200 (created)
    expect(responseRegister.status).toBe(200);
    expect(responseRegister.body.success).toBe("New user created!");

    // Retrieve the created user from the database using Mongoose
    const createdUser = await User.findOne({ email: mockUser.email });

    // Retrieve taction token
    const actionToken = await ActionToken.findOne({ entity_id: createdUser.id });

    // Make a request to verify email
    const responseVerifyEmail = await request(app)
        .get(`/auth/verify-email/${actionToken.id}`);

    // Assert
    // Expect that the response status is 200
    expect(responseVerifyEmail.status).toBe(200);
    expect(responseVerifyEmail.body.accessToken).toBeDefined();

    // Make a POST request to log in
    const response = await request(app)
        .get('/auth/verify-email/resend')
        .send({
            email: 'benjo1@test.com'
        });

    // Assert
    // Expect that the response status is 200
    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Email is already verified!");
});

test('Resend verification email: wrong email', async () => {
    // Create a mock user object
    const mockUser = {
        username: 'benjo2',
        email: 'benjo2@test.com',
        password: '123456'
    };

    // Make a POST request to create a new user
    const responseRegister = await request(app)
        .post('/auth/register')
        .send(mockUser);

    // Assert
    // Expect that the response status is 200 (created)
    expect(responseRegister.status).toBe(200);
    expect(responseRegister.body.success).toBe("New user created!");

    // Retrieve the created user from the database using Mongoose
    const createdUser = await User.findOne({ email: mockUser.email });

    // Retrieve taction token
    const actionToken = await ActionToken.findOne({ entity_id: createdUser.id });

    // Make a request to verify email
    const responseVerifyEmail = await request(app)
        .get(`/auth/verify-email/${actionToken.id}`);

    // Assert
    // Expect that the response status is 200
    expect(responseVerifyEmail.status).toBe(200);
    expect(responseVerifyEmail.body.accessToken).toBeDefined();

    // Make a POST request to log in
    const response = await request(app)
        .get('/auth/verify-email/resend')
        .send({
            email: 'benjo1234@test.com'
        });

    // Assert
    // Expect that the response status is 200
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Wrong email!");
});

test('Resend verification email', async () => {
    // Create a mock user object
    const mockUser = {
        username: 'benjo3',
        email: 'benjo3@test.com',
        password: '123456'
    };

    // Make a POST request to create a new user
    const responseRegister = await request(app)
        .post('/auth/register')
        .send(mockUser);

    // Assert
    // Expect that the response status is 200 (created)
    expect(responseRegister.status).toBe(200);
    expect(responseRegister.body.success).toBe("New user created!");

    // Make a POST request to log in
    const response = await request(app)
        .get('/auth/verify-email/resend')
        .send({
            email: 'benjo3@test.com'
        });

    // Assert
    // Expect that the response status is 200
    expect(response.status).toBe(200);
    expect(response.body.success).toBe("New verification mail sent!");
});


test('Retrieve URLs for authenticated user', async () => {
    // Create a mock user object
    const mockUser = {
        username: 'benjo123',
        email: 'benjo123@test.com',
        password: '123456'
    };

    // Make a POST request to create a new user
    const responseRegister = await request(app)
        .post('/auth/register')
        .send(mockUser);

    // Assert
    // Expect that the response status is 200 (created)
    expect(responseRegister.status).toBe(200);
    expect(responseRegister.body.success).toBe("New user created!");

    // Retrieve the created user from the database using Mongoose
    const createdUser = await User.findOne({ email: mockUser.email });

    // Retrieve taction token
    const actionToken = await ActionToken.findOne({ entity_id: createdUser.id });

    // Make a request to verify email
    const responseVerifyEmail = await request(app)
        .get(`/auth/verify-email/${actionToken.id}`);

    // Assert
    // Expect that the response status is 200
    expect(responseVerifyEmail.status).toBe(200);
    expect(responseVerifyEmail.body.accessToken).toBeDefined();

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Make a GET request to the URL index route with the access token
    const response = await request(app)
        .get('/api//url')
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`);

    // Assert
    expect(response.status).toBe(200);
});


test('create new URL for authenticated user', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Create a mock url object
    const mockUrl = {
        trueUrl: 'https://www.google.com/',
        keyWord: 'natalia'
    };

    // Make a GET request to the URL create route with the access token
    const response = await request(app)
        .post('/api//url')
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`)
        .send(mockUrl);

    // Assert
    expect(response.status).toBe(200);

    // Retrieve the created user from the database using Mongoose
    const createdUser = await User.findOne({ email: 'benjo123@test.com' });
    // Retrive created URL from database
    const createdUrl = await Url.findOne({ trueUrl: mockUrl.trueUrl });

    // Assert that created URL exists
    expect(createdUrl).toBeDefined();
    //Assert that created URL is mocked URL
    expect(createdUrl.trueUrl).toBe(mockUrl.trueUrl);
    // Assert that author of URL is authenticated user
    expect(createdUrl.author).toBe(createdUser.id);
});

test('Validations for create new URL: URL is not with https prefix', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Create a mock url object
    const mockUrl = {
        trueUrl: 'www.google.com/'
    };

    // Make a GET request to the URL create route with the access token
    const response = await request(app)
        .post('/api//url')
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`)
        .send(mockUrl);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe("True Url must be a valid HTTPS link");

});

test('Validations for create new URL: URL is required', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Create a mock url object
    const mockUrl = {
        trueUrl: ''
    };

    // Make a GET request to the URL create route with the access token
    const response = await request(app)
        .post('/api//url')
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`)
        .send(mockUrl);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe("Url is required");

});

test('Validations for create new URL: the key word cant be certian word', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Create a mock url object
    const mockUrl = {
        trueUrl: 'https://www.google.com/',
        keyWord: 'login'
    };

    // Make a GET request to the URL create route with the access token
    const response = await request(app)
        .post('/api//url')
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`)
        .send(mockUrl);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe("Invalid keyword");

});

test('Validations for create new URL: URL with wanted keyword already exists', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Create a mock url object
    const mockUrl = {
        trueUrl: 'https://www.google.com/',
        keyWord: 'natalia'
    };

    // Make a GET request to the URL create route with the access token
    const response = await request(app)
        .post('/api//url')
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`)
        .send(mockUrl);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("URL already exist, change your keyword!");

});

test('Show URL', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Retrive created URL from database
    const createdUrl = await Url.findOne({ shortUrl: 'natalia' });

    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .get(`/api//url/${createdUrl.id}`)
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`);

    // Assert
    expect(response.status).toBe(200);
});

test('Show URL', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Retrive created URL from database
    const createdUrl = await Url.findOne({ shortUrl: 'natalia' });

    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .get(`/api//url/${createdUrl.id}`)
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`);

    // Assert
    expect(response.status).toBe(200);
});

test('Validations for show URL: url doesnt exist in db', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .get('/api//url/6486b8c3053cbb8e0e427a2c')
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`);

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Url doesn't exist!");
});

test('Validations for show URL: url author and user id doesnt match', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Retrive created URL from database
    const createdUrl = await Url.findOne({ shortUrl: 'natalia' });

    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .get(`/api//url/${createdUrl.id}`)
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`);

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized!");
});

test('Update URL', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Retrive created URL from database
    const createdUrl = await Url.findOne({ shortUrl: 'natalia' });

    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .put(`/api//url/${createdUrl.id}`)
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`).
        send({
            trueUrl: 'https://www.google12345.com/',
            shortUrl: 'papak'
        });

    // Assert
    expect(response.status).toBe(200);

    // Retrive created URL from database
    const updatedUrl = await Url.findOne({ shortUrl: 'papak' });

    // Assert that created URL exists
    expect(updatedUrl).toBeDefined();
    //Assert that created URL is mocked URL
    expect(updatedUrl.trueUrl).toBe('https://www.google12345.com/');
    // Assert that author of URL is authenticated user
    expect(updatedUrl.shortUrl).toBe('papak');
});

test('Validations for update URL: URL doesnt exist', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .put(`/api//url/6486b8c3053cbb8e0e427a2c`)
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`).
        send({
            trueUrl: 'https://www.google12345.com/',
            shortUrl: 'papak'
        });

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Url doesn't exist!");
});

test('Validations for update URL: user id and URL id doesnt match', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Retrive created URL from database
    const createdUrl = await Url.findOne({ shortUrl: 'papak' });

    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .put(`/api//url/${createdUrl.id}`)
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`).
        send({
            trueUrl: 'https://www.google12345.com/',
            shortUrl: 'papak'
        });

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized!");
});

test('Validations for update URL: Keyword already in use', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Create a mock url object
    const mockUrl = {
        trueUrl: 'https://www.google.com/',
        keyWord: 'natalia'
    };

    // Make a GET request to the URL create route with the access token
    const responseCreate = await request(app)
        .post('/api//url')
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`)
        .send(mockUrl);

    // Retrive created URL from database
    const createdUrl = await Url.findOne({ shortUrl: 'papak' });

    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .put(`/api//url/${createdUrl.id}`)
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`).
        send({
            trueUrl: 'https://www.google12345.com/',
            keyWord: 'natalia'
        });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("URL already exist, change your keyword!");
});

test('Validation for delete URL: user id doesnt match URL author', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Retrive created URL from database
    const createdUrl = await Url.findOne({ shortUrl: 'natalia' });

    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .delete(`/api//url/${createdUrl.id}`)
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`);

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized!");
});

test('Delete URL', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Retrive created URL from database
    const createdUrl = await Url.findOne({ shortUrl: 'natalia' });

    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .delete(`/api//url/${createdUrl.id}`)
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("URL deleted successfuly!");
});

test('Validations for delete URL: URL doesnt exist', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .delete('/api//url/6486b8c3053cbb8e0e427a2c')
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`);

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Url doesn't exist!");
});

test('Redirect', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Retrive created URL from database
    const createdUrl = await Url.findOne({ shortUrl: 'papak' });

    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .get(`/${createdUrl.shortUrl}`)
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`);

    // Assert
    expect(response.status).toBe(302);
});

test('Validations for redirect: Url doesnt exist', async () => {

    // Make a POST request to log in
    const responseLogin = await request(app)
        .post('/auth/login')
        .send({
            email: 'benjo123@test.com',
            password: '123456'
        });

    // Assert
    // Expect that the response status is 200
    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body.accessToken).toBeDefined();

    // Retrive created URL from database
    const createdUrl = await Url.findOne({ shortUrl: 'papak' });
  
    // Make a GET request to the URL show route with the access token
    const response = await request(app)
        .get('/natalia')
        .set('Authorization', `Bearer ${responseLogin.body.accessToken}`);

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("URL doesn't exist!");
});








