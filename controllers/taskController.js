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
            target_dt: req.body.date,
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
    });
})

router.get('/list', (req, res) => {
    res.json('texting')
})

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