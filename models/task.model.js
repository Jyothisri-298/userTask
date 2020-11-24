var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
 
var Todo = new Schema({
    title : String,
    desc : String,
    media : { data: Buffer, contentType: String },
    target_dt : Date,
    status : String
});
 
mongoose.model( 'Todo', Todo );
