const express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var multer = require('multer');
const mongoose = require('mongoose');
const Todo = mongoose.model("Todo");

//To store files in uploads folder
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


//For stroing task details into Database
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
        if (!req.body._id) {
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
        } else {
            Todo.updateOne({
                _id: req.body._id
            }, req.body, {
                new: true
            }, (err, doc) => {
                if (!err) {
                    res.redirect('task/list');
                } else {
                    if (err.name == 'ValidationError') {
                        handleValidationError(err, req.body);
                        res.render("task/addOrEdit", {
                            viewTitle: 'Update Task',
                            task: req.body
                        });
                    } else
                        console.log('Error during record update : ' + err);
                }
            });
        }
    });
})
//To get all Task Lists
router.get('/list', async (req, res) => {
    const resPerPage = 20;
    const page = req.params.page || 1;

    try {
        const numOfTasks = await Todo.countDocuments({});

        const docs = await Todo.find({})
            .skip((resPerPage * page) - resPerPage)
            .limit(resPerPage);
        let finalDocs = docs.map(doc => {
            if (doc.media.data) {
                doc.media.data = doc.media.data.toString('base64');
                doc.media.contentType2 = doc.media.contentType.split("/")[0]
            } else {
                doc.media.contentType2 = "img"
            }
            return {
                _id: doc._id,
                title: doc.title,
                desc: doc.desc,
                media: doc.media,
                target_dt: new Date(doc.target_dt).toLocaleDateString(),
                status: doc.status
            }
        });
        res.render("task/list", {
            list: finalDocs,
            currentPage: page,
            pages: Math.ceil(numOfTasks / resPerPage),
            numOfResults: numOfTasks
        })

    } catch (err) {
        throw new Error(err);
    }
});

//For Task Pagination
router.get('/list/:page', async (req, res) => {
    const resPerPage = 20;
    const page = req.params.page || 1;

    try {
        const numOfTasks = await Todo.countDocuments({});

        const docs = await Todo.find({})
            .skip((resPerPage * page) - resPerPage)
            .limit(resPerPage);
        let finalDocs = docs.map(doc => {
            if (doc.media.data) {
                doc.media.data = doc.media.data.toString('base64');
                doc.media.contentType2 = doc.media.contentType.split("/")[0]
            } else {
                doc.media.contentType2 = "img"
            }
            return {
                _id: doc._id,
                title: doc.title,
                desc: doc.desc,
                media: doc.media,
                target_dt: new Date(doc.target_dt).toLocaleDateString(),
                status: doc.status
            }
        });
        res.render("task/list", {
            list: finalDocs,
            currentPage: page,
            pages: Math.ceil(numOfTasks / resPerPage),
            numOfResults: numOfTasks
        })

    } catch (err) {
        throw new Error(err);
    }
})

//To update the particular Task
router.get('/:id', (req, res) => {
    Todo.findById(req.params.id, (err, doc) => {
        if (!err) {
            if (doc.media.data) {
                doc.media.data = doc.media.data.toString('base64');
                doc.media.contentType2 = doc.media.contentType.split("/")[0]
            } else {
                doc.media.contentType2 = "img"
            }
            let finalDoc = {
                _id: doc._id,
                title: doc.title,
                desc: doc.desc,
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


//To delete the particular Task
router.get('/delete/:id', (req, res) => {
    Todo.deleteOne({
        _id: req.params.id
    }, (err, doc) => {
        if (!err) {
            res.redirect('/task/list');
        } else {
            console.log('Error in task delete :' + err);
        }
    });
});

//Searching using title
router.post('/search', (req, res) => {
    Todo.find({
        title: {
            '$regex': req.body.search,
            '$options': 'i'
        }
    }, (err, docs) => {
        if (!err) {
            let finalDocs = docs.map(doc => {
                if (doc.media.data) {
                    doc.media.data = doc.media.data.toString('base64');
                    doc.media.contentType2 = doc.media.contentType.split("/")[0]
                } else {
                    doc.media.contentType2 = "img"
                }
                return {
                    _id: doc._id,
                    title: doc.title,
                    desc: doc.desc,
                    media: doc.media,
                    target_dt: new Date(doc.target_dt).toLocaleDateString(),
                    status: doc.status
                }
            })
            res.render("task/list", {
                list: finalDocs
            })
        } else {
            console.log("Error in retrieving task list :" + err);
        }
    })
})

//To delete multiple tasks
router.post('/deleteLists', (req, res) => {
    let records = req.body.check;
    Todo.deleteMany({
        _id: records
    }, function (err, result) {
        if (!err) {
            res.redirect('/task/list');
        } else {
            console.log('Error in task delete :' + err);
        }
    })
})

//error handling
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