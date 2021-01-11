const bodyParser = require('body-parser');
const express = require('express');
const session= require('express-session');
const app = express();
const port = process.env.PORT || 3000;
const exphbs = require('express-handlebars');
const fortune = require("./lib/fortune.js");
const formidable = require('formidable');
const jqupload = require('jquery-file-upload-middleware');
const credentials = require('./credentials.js');
const cookieParser = require('cookie-parser');

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser(credentials.cookieSecret));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
}));

// REGEX

const VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// config jquery file upload

app.use('/upload', (req, res, next) => {
    const now = Date.now();
    jqupload.fileHandler({
        uploadDir: (() => {
            return __dirname + '/public/uploads/' + now;
        }),
        uploadUrl: (() => {
            return '/uploads/' + now;
        }),

    })(req, res, next);
});


// config flash message middleware

app.use((req, res, next) => {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

// custom routes get

app.get(('/'),(req, res) => {
    res.render('home')
});

app.get(('/about'),(req, res) => {
    res.render('about', { 
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});

app.get('/tours/hood-river', (req, res) => {
    res.render('tours/hood-river');
});

app.get('/tours/oregon-coast', (req, res) => {
    res.render('tours/oregon-coast');
});

app.get('/tours/request-group-rate', (req, res) => {
    res.render('tours/request-group-rate');
});

app.get('/newsletter', (req, res) => {
    res.render('newsletter', { csrf: 'CSRF token goes here'});
});

app.get('/thank-you', (req, res) => {
    res.render('thank-you');
});

// uploading photos
// two arguments getYear and getMonth

app.get('/contest/vacation-photo', (req, res) => {
    const now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(), month: now.getMonth()
    });
});

app.get('/newsletter/archive', (req, res) => {
    res.render('newsletter/archive');
});

// custom routes post

app.post('/process', (req, res) => {
    if(req.xhr || req.accepts('json,html') === 'json') {
        res.send({ success: true});
    }else{
        res.redirect(303, '/thank-you');
    }
});

app.post('/contest/vacation-photo/:year/:month', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, ((err, fields, files) => {
        if(err) return res.redirect(303, '/error');
        console.log('received fields');
        console.log(fields);
        console.log('received files');
        console.log(files);
        res.redirect(303, '/thank-you');
    }));
});

app.post('/newsletter', (req, res) => {
    const name = req.body.name || '', email = req.body.email || '';

    // input validation
    if(!email.match(VALID_EMAIL_REGEX)) {
        if(req.xhr) return res.json({ error : 'Invalid name email address'});
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you entered was not valid.',
        };
        return res.redirect(303, '/newsletter/archive');
    }

    new NewsletterSignup({ name: name, email: email }).save((err) => {
        if(err) {
            if(req.xhr) return res.json({ error: 'Database error.'});
            req.session.flash = {
                type: 'danger',
                intro: 'Database error!',
                message: 'There was a database error. Please try again later.',
            };
            return res.redirect(303, '/newsletter/archive');
        }

        if(req.xhr) return res.json({ success: true});
        req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: 'You have now been signed up for the newsletter.',
        };
        return res.redirect(303, '/newsletter/archive');
    });
});

function NewsletterSignup() {

}

NewsletterSignup.prototype.save = function(cb){
	cb();
};

// Middleware

app.use((req, res, next) => {
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    next();
});

// custom 404 page

app.use((req, res, next) => {
    res.status(404);
    res.render('404');
});

// 500 error handler

app.use((err,req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.use((req, res, next) => {
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weatherContext = getWeatherData();
    next();
});

// weather data

function getWeatherData() {
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ]
    }
};

app.listen(port, () => {
    console.log(`Running in http://localhost:${port}`)
});