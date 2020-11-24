var express = require('express');
var db = require('./models/db');
const taskController = require('./controllers/taskController');
var app = express();


app.get('/', (req,res) => {
    res.send('Hello');
});

app.use('/task', taskController);


app.listen(3000, () => {
    console.log('Server is listening at 3000');
})



