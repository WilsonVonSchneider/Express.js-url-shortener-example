require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const connectDB = require('./config/db.config');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const redirectRoutes = require('./routes/redirect');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/Auth');
const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

//use json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//Auth routes
app.use('/auth', authRoutes);

//Routes after this falls un der Auth middleware
app.use(authMiddleware);

//Url shortening api routes
app.use('/api', apiRoutes);

//Redirect route
app.use('/', redirectRoutes);

// Event handler for when the MongoDB connection is open
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

