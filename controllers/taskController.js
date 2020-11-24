const express = require('express');
var router = express.Router();

router.get('/',(req,res) => {
    res.render("task/addOrEdit",{
        viewTitle: "Insert Task"
    })
})

module.exports = router;