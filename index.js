const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const exphbs = require('express-handlebars');
const fortune = require("./lib/fortune.js");

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'))

// custom routes

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
})

app.get('/tours/request-group-rate', (req, res) => {
    res.render('tours/request-group-rate');
});

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
})

// 500 error handler

app.use((err,req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.render('500');
})

app.listen(port, () => {
    console.log(`Running in http://localhost:${port}`)
});