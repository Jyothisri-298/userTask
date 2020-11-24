var express = require('express');

var app = express();


app.get('/', (req,res) => {
    res.send('Hello');
});


app.listen(3000, () => {
    console.log('Server is listening at 3000');
})



