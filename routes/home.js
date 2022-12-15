
// homepage router
const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require("fs-extra");
const {model} = require("../model");
module.exports = router;

// GET /home
router.get('/', (req, res, next) => {
    model.posts.find({postType: "question"}).sort({creationDate: -1}).toArray().then(posts => {
        console.log("found all questions");
        // show only post that are questions, reverse the array since 
        // normally the posts are sorted by date (newest last)
        res.format({
            'text/html': () => {
                res.render('index', {
                    users: users,
                    posts: posts, 
                    layout: false
                });
            },
            'application/json': () => {
                res.json({posts: posts, users: users});
            }
        });
    })
});

router.get('/posts', (req, res, next) => {
    model.posts.find({postType: "question"}).sort({creationDate: -1}).toArray().then(posts => {
        console.log("found all questions");

        model.users.find({}).toArray().then(users => {

            res.format({
                'text/html': () => {
                    res.render('index', {
                        users: users,
                        posts: posts, 
                        layout: false
                    });
                },
                'application/json': () => {
                    let data = {
                        users: users,
                        posts: posts
                    }
                    res.json(data);
                }
            });
        });
    })
});