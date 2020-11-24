
require('./task.model');

var mongoose = require( 'mongoose' );

var url = "mongodb://localhost:27017/Todo";

mongoose.connect(url,{ useNewUrlParser: true,useUnifiedTopology: true },function(err,db){
    if(err) return console.log("Error while connecting with database");
    console.log("Database connected");
})

