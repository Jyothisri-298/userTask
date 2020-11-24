const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

const db = require('./models/db');
const taskController = require('./controllers/taskController');

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());
app.set('views', path.join(__dirname, '/views/'));
app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'mainLayout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('view engine', 'hbs');

app.get('/', (req,res) => {
    res.send('Hello');
});


app.use('/task', taskController);



app.listen(3000, () => {
    console.log('Server is listening at 3000');
})




