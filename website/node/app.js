"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const passport = require('passport');
const aad = require('./aad');

const app = express();

app.set('view engine', 'pug');
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "This is a super duper top secret that also should not be shared"
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use('AzureAD', aad.strategy);

// Enable static files
app.use(express.static('/public'));

// Add authentication routes
app.get("/login/aad", aad.authenticate);
app.get("/login/aad/callback", aad.authenticate, aad.authenticateCallback);
app.post("/login/aad/callback", aad.authenticate, aad.authenticateCallback);

// Add agent route
app.get(
    '/agent', // route
    aad.isAuthenticated, // authentication required
    (req, res) => {
        // display page
        res.render('agent', { displayName: req.user.displayName });
    }
);

// Add agent route
app.get(
    '/eventadmin', // route
    aad.isAuthenticated, // authentication required
    (req, res) => {
        // display page
        res.render('eventadmin', { displayName: req.user.displayName });
    }
);

let port = process.env.PORT || 3000
// Start server
app.listen(port, () => console.log(`Server up on port ${port}!`));
