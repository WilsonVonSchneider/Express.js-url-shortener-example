### URL Shortener Example
This project is a URL shortening service that allows users to create shortened versions of long URLs.
It includes user authentication features and a Swagger API documentation for better understanding and testing.

### Installation and Setup

# Before running the project, make sure you have the following prerequisites installed:
Node.js (v14.0.0 or higher)
MongoDB

## Follow these steps to set up the project:

# Install dependencies:
npm install

# Start the server:
npm run dev

# Dependencies:
@types/sequelize: ^4.28.19
bcrypt: ^5.1.1
cookie-parser: ~1.4.4
debug: ~2.6.9
dotenv: ^16.3.1
express: ^4.18.2
express-jwt: ^8.4.1
express-validator: ^7.0.1
http-errors: ~1.6.3
jade: ^0.29.0
jsonwebtoken: ^9.0.2
mongodb: ^6.3.0
mongoose: ^8.0.3
morgan: ~1.9.1
nodemailer: ^6.9.8
pg: ^8.11.3
sequelize: ^6.35.2
shortid: ^2.2.16
swagger-jsdoc: ^6.2.8
swagger-ui-express: ^5.0.0

# Dev Dependencies:
jest: ^29.7.0
mongodb-memory-server: ^9.1.5
nodemon: ^3.0.2
supertest: ^6.3.3


### API Documentation
Swagger is integrated into the project to provide API documentation. 
Visit API Documentation to explore the available endpoints, request formats, and responses.

### Routes
## Authentication
# Register a New User
Endpoint: /api/auth/register
Method: POST
Request Body:
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
Responses:
201: Successful registration
400: Bad Request Data or User already exists
500: Internal Server Error

# Re-send Email Verification Token
Endpoint: /api/auth/resend-verify-token
Method: GET
Parameters:
email: User's email address
password: User's password
Responses:
200: Verification token re-sent successfully
400: User doesn't exist or Bad Request - Token creation failed
404: User doesn't exist
500: Internal Server Error

# Verify Email
Endpoint: /api/auth/verify-email/{token}
Method: GET
Path Parameter:
token: The verification token
Responses:
200: Email verified successfully
403: Unauthorized or Email already verified
404: Invalid verification token or User doesn't exist
500: Internal Server Error

# Log in an Existing User
Endpoint: /api/auth/login
Method: POST
Request Body:
{
  "email": "john.doe@example.com",
  "password": "password123"
}
Responses:
200: Successful login
400: User not found, User not verified, or Password does not match
500: Internal Server Error

## URL Shortener
# Shorten a Long URL
Endpoint: /api/url/shorten
Method: POST
Security: Requires JWT authentication
Request Body:
{
  "longURL": "https://www.youtube.com/",
  "customShortCode": "yt"
}
Responses:
201: URL successfully shortened
400: Bad Request Data
401: User not logged in
# Redirect to the Long URL
Endpoint: /api/url/{shortCode}
Method: GET
Path Parameter:
shortCode: Short code generated for the URL
Responses:
302: Redirect to the long URL
404: Short code not found

## Tests
# Run unit tests using the following command:
npm test

## Credits

This app was created by Matej Zagar.
