const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const dbConfig = require('./config/database.config');

const auth = require('./middleware/auth');
const loginRoute = require('./routes/login.route');
const logoutRoute = require('./routes/logout.route');
const registerRoute = require('./routes/register.route');
const userRoute = require('./routes/user.route');
const adminRoute = require('./routes/admin.route');

const app = express();


// database
// TODO: add superuser
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('Connected to the database.');
}).catch(err => {
    console.log('Could not connect to the database.');
    console.error(err);
    process.exit();
});


// app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
// app.use(express.static(path.join(__dirname, 'dist/mean-stack-crud-app')));
// app.use('/', express.static(path.join(__dirname, 'dist/mean-stack-crud-app')));


// routes
app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/logout', logoutRoute);
app.use('/user', userRoute);
app.use('/admin', adminRoute);


// 404 error
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: "Page not found."
    });
});

// 404 error
app.use((req, res, next) => {
    next(createError(404)); // TODO: createError(404) ?
});

// error handler
app.use(function (err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});


// port and listen
const port = process.env.PORT || 4041;
const server = app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}.`);
});
