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
app.engine('hbs', exphbs({
    extname: 'hbs',
    defaultLayout: 'mainLayout',
    layoutsDir: __dirname + '/views/layouts/',
    helpers: {
        math: function (lvalue, operator, rvalue) {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            return {
                "+": lvalue + rvalue,
                "-": lvalue - rvalue,
                "*": lvalue * rvalue,
                "/": lvalue / rvalue,
                "%": lvalue % rvalue
            } [operator];
        },
        checkIf: function (a, operator, b, options) {
            return {
                '==': a == b ? options.fn(this) : options.inverse(this),
                '===': a === b ? options.fn(this) : options.inverse(this),
                '!=': a != b ? options.fn(this) : options.inverse(this),
                '!==': a !== b ? options.fn(this) : options.inverse(this),
                '<': a < b ? options.fn(this) : options.inverse(this),
                '<=': a <= b ? options.fn(this) : options.inverse(this),
                '>': a > b ? options.fn(this) : options.inverse(this),
                '>=': a >= b ? options.fn(this) : options.inverse(this),
                '&&': a && b ? options.fn(this) : options.inverse(this),
                '||': a || b ? options.fn(this) : options.inverse(this),
            } [operator]
        }
    }
}));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.send('Hello');
});


app.use('/task', taskController);



app.listen(3000, () => {
    console.log('Server is listening at 3000');
})