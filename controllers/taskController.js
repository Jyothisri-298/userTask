const express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var multer = require('multer');
const mongoose = require('mongoose');
const Todo = mongoose.model("Todo");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = "uploads"
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {
                recursive: true
            });
        }
        cb(null, dir)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
});

var upload = multer({
    storage: storage
}).single('file');


router.get('/', (req, res) => {
    res.render("task/addOrEdit", {
        viewTitle: "Insert Task"
    })
})

router.post('/', (req, res) => {

    upload(req, res, function (err) {
        if (!err) {
            var obj = {
                title: req.body.title,
                desc: req.body.desc,
                media: {
                    data: fs.readFileSync(req.file.path),
                    contentType: req.file.mimetype
                },
                target_dt: req.body.date,
                status: req.body.status
            }
            console.log(obj);

           Todo.create(obj, (err, item) => { 
                if (err) { 
                    console.log(err); 
                } 
                else { 
                    console.log("SUCESSSSS");//res.redirect('/'); 
                } 
            }); 
        }
        else{

        }
    });
})

module.exports = router;