const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

// Setup serialization
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Configure options
const aadStrategyOptions = {
    // properties to be configured in .env or environmental variables
    redirectUrl: 'http://localhost:3000/login/aad/callback',
    clientID: '421ed6a8-dd46-45cc-8d73-f940ec2dca7a',
    clientSecret: 'kheqBJJ795$isaGTEF41!#?',

    // DO NOT TOUCH!! :-)
    realm: 'common',
    identityMetadata: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
    skipUserProfile: false,
    validateIssuer: false,
    allowHttpForRedirectUrl: true,
    responseType: 'code',
    responseMode: 'form_post',
    scope: ['email', 'profile'],
    passReqToCallback: false
};

// User cache management
const users = [];
const aadStrategyCallback = (iss, sub, user, jwtClaims, access_token, refresh_token, params, done) => {
    const existingUser = users.find(u => u.oid === user.oid);
    if (existingUser) {
        return done(null, existingUser);
    } else {
        user.access_token = access_token;
        user.refresh_token = refresh_token;
        user.jwtClaims = jwtClaims;
        users.push(user);
        return done(null, user);
    }
}

exports.strategy = new OIDCStrategy(aadStrategyOptions, aadStrategyCallback);
exports.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        req.session.returnTo = req.path;
        res.redirect('/login/aad');
    }
}
exports.authenticate = passport.authenticate("AzureAD");
exports.authenticateCallback = (req, res, next) => {
    res.redirect(req.session.returnTo || '/');    
}
