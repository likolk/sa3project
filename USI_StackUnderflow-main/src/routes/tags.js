const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require("fs-extra");
const { model } = require("../../model/");

module.exports = router;


router.get('/', (req, res) => {
    
    model.tags.find({}).toArray().then(tags => {
        console.log("tags names ", tags.name);
        if (!req.accepts('text/html')) {
            return res.render({ tags });
        }

        return res.render("tags.ejs", {
            tags,
            layout: false
        });

    })

});

router.get('/:name', (req, res) => {

    let name = req.params.name;

    model.posts.find({}).toArray().then(all_posts => {

        let posts = [];

        for (let i = 0; i < all_posts.length; i++) {

            //case 1: field tags do not exist OR do not match
            if (typeof all_posts[i].tags == 'undefined' || !all_posts[i].tags.includes(name)) {
                continue;
            }
            //case 2: field tags exists and match
            else if (all_posts[i].tags.includes(name)) {
                posts.push(all_posts[i]);
            }
        }

        if (!req.accepts('text/html')) {
            return res.render({ posts });
        }
        return res.render("tags_name.ejs", {
            posts,
            layout: false
        });
    });

});