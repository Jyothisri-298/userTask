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
        var obj = {
            title: req.body.title,
            desc: req.body.desc,
            target_dt: new Date(req.body.date).toLocaleDateString(),
            status: req.body.status
        }
        if (req.file) {
            obj.media = {
                data: fs.readFileSync(req.file.path),
                contentType: req.file.mimetype
            }
        } else {
            obj.media = null;
        }
        if(!req.body._id){
            Todo.create(obj, (err, item) => {
                if (err && err.name == "ValidationError") {
                    handleValidationError(err, req.body);
                    res.render("task/addOrEdit", {
                        viewTitle: "Insert Task",
                        task: req.body
                    })
                } else {
                    res.redirect('task/list');
                }
            });
        }
        else{
            Todo.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
                if (!err) { res.redirect('task/list'); }
                else {
                    if (err.name == 'ValidationError') {
                        handleValidationError(err, req.body);
                        res.render("task/addOrEdit", {
                            viewTitle: 'Update Task',
                            employee: req.body
                        });
                    }
                    else
                        console.log('Error during record update : ' + err);
                }
            });
        }
    });
})

router.get('/list', (req, res) => {
    Todo.find((err,docs) => {
        if(!err){
            let finalDocs = docs.map(doc=>{
                if(doc.media.data){
                    doc.media.data = doc.media.data.toString('base64');
                    doc.media.contentType2 = doc.media.contentType.split("/")[0]
                }
                else{
                    doc.media.contentType2 = "img"
                }
                return {
                    _id:doc._id,
                    title:doc.title,
                    desc:doc.desc,
                    media: doc.media,
                    target_dt: new Date(doc.target_dt).toLocaleDateString(),
                    status: doc.status
                 }
            })
            res.render("task/list",{
                list: finalDocs
            })
        }
        else{
            console.log("Error in retrieving task list :" + err);
        }
    })
})

router.get('/:id', (req, res) => {
    Todo.findById(req.params.id, (err, doc) => {
        if (!err) {
            //let finalDocs = docs.map(doc=>{
                if(doc.media.data){
                    doc.media.data = doc.media.data.toString('base64');
                    doc.media.contentType2 = doc.media.contentType.split("/")[0]
                }
                else{
                    doc.media.contentType2 = "img"
                }
                let finalDoc =  {
                    _id:doc._id,
                    title:doc.title,
                    desc:doc.desc,
                    media: doc.media,
                    target_dt: new Date(doc.target_dt).toLocaleDateString(),
                    status: doc.status
                 }
            res.render("task/addOrEdit", {
                viewTitle: "Update Task",
                task: finalDoc
            });
        }
    });
});

function handleValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'title':
                body['titleError'] = err.errors[field].message;
                break;
            case 'desc':
                body['descError'] = err.errors[field].message;
                break;
            case 'target_dt':
                body['dateError'] = err.errors[field].message;
                break;
            default:
                break;
        }
    }
}

module.exports = router;