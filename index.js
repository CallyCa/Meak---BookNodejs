const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const exphbs = require('express-handlebars');

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'))


// fortune cookie

const fortunes= [
    "Conquer your fears or they will conquer you.",
    "Rivers need springs.",
    "Do not fear what you don't know.",
    "You will have a pleasant surprise.",
    "Whenever possible, keep it simple.",
];

// custom routes

app.get(('/'),(req, res) => {
    res.render('home')
});

app.get(('/about'),(req, res) => {
    var randomFortune = 
        fortunes[Math.floor(Math.random() * fortunes.length)];
    res.render('about', { fortune: randomFortune});
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