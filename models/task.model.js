var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Todo = new Schema({
    title: {
        type: String,
        required: "Title is required !"
    },
    desc: {
        type: String,
        required: "Description is required !"
    },
    media: {
        data: Buffer,
        contentType: String
    },
    target_dt: {
        type: Date,
        required: "Target date is required !"
    },
    status: {
        type: String
    }
});

mongoose.model('Todo', Todo);