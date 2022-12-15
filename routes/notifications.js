const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require("fs-extra");
module.exports = router;


router.get('/', (req, res) => {
    res.render('notifications.ejs');
});

