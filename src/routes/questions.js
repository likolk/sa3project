// route: /questions

const express = require('express');
const { isObjectIdOrHexString } = require('mongoose');
const { Socket } = require('socket.io');
const router = express.Router();
var ObjectId = require('mongodb').ObjectId;
module.exports = router;
const {model} = require("../../model/");
const showdown = require("../public/js/showdown.js");
const converter = new showdown.Converter();
var session = require('web-session');
let alert = require('alert'); 
const new_users = require("../routes/users");


router.get('/ask', (req, res) => {
    res.render('newQuestion', {layout: false});
    res.render('newQuestion', { layout: false });
    res.render('newQuestion', {layout: false});
});

router.get('/', (req, res) => {
    model.posts.find({postType: "question"}).toArray().then(posts => {
        console.log("new here");
        let reversed_posts = posts.reverse();
        res.json(reversed_posts);
    })
});

router.get('/:id', (req, res) => {
    console.log("got id");
    let requestedId = parseInt(req.params.id)
    let id = {id: requestedId};
    // console.log(id);
    model.posts.findOne(id).then(question => {
        model.users.find({}).toArray().then(users => {
            let parentId = {parentId: requestedId};
            model.posts.find(parentId).toArray().then(answers => {
                // console.log(answers.bodyMarkdown);
                res.format({
                    'text/html': () => {
                        res.render('questions', {question, answers, users, layout: false});
                    },
                    'application/json': () => {
                        res.json({question, answers, users});
                    }
                })
            });
        });
    });
});



router.post("/answer/:id",(req, res)=>{
    console.log("posted");
    model.posts.find({}).toArray().then(result => {
        let id = req.user == undefined? 0 : req.user.id;
        new_ans={
            "favoriteCount": 0,
            "commentCount": 0,
            "answerCount": 0,
            "answerScore": 0,
            "score": 0,
            "id": (result.length + 1),
            "postType": "answer",
            "parentId": parseInt(req.params.id),
            "ownerUserId": id,
            "postState": "Published",
            "creationDate": (new Date()).toJSON(),
            "bodyMarkdown": req.body.answer,
            "body": converter.makeHtml(req.body.answer),
        }
        model.posts.insertOne(new_ans).then(result => {
            model.posts.updateOne({"id":parseInt(req.params.id)},{ $inc: { "answerCount": 1}}).then(result => {
                console.log("inserted");
                if(id!=0){
                    model.users.updateOne({"id":id},{ $inc: { "answerCount": 1}}).then(result => {
                        res.redirect(`/questions/${req.params.id}`);
                    });
                } else {
                    res.redirect(`/questions/${req.params.id}`);
                }
            });
        });
    });
});


router.post("/ask", (req, res)=>{
    console.log("posted");
    console.log(req.body.tags);
    console.log(req.body.t);
    console.log(req.body.q);
    model.tags.find({}).toArray().then(tags =>{
        let i = 0;
        req.body.tags.split('|').forEach((t)=>{
            if(t!=''){
                if(tags.find(e=>e.name==t)){
                    model.tags.updateOne({"name":t},{ $inc: { "count": 1}});
                } else {
                    let new_tag = {
                        "isSpecialTag": false,
                        "count": 1,
                        "id": tags.length + 5 + i,
                        "creationDate": (new Date()).toJSON(),
                        "name": t
                    }
                    model.tags.insertOne(new_tag);
                    ++i;
                }
            }
        });
    });
    model.posts.find({}).toArray().then(result => {
        console.log(result[result.length - 1]);
        let id = req.user == undefined? 0 : req.user.id;
        new_ask={
            "favoriteCount": 0,
            "commentCount": 0,
            "answerCount": 0,
            "answerScore": 0,
            "score": 0,
            "id": (result.length + 1),
            "postType": "question",
            "viewCount": 0,
            "acceptedAnswerId": 0,
            "ownerUserId": id,
            "postState": "Published",
            "creationDate": (new Date()).toJSON(),
            "tags": req.body.tags,
            "title": req.body.t,
            "bodyMarkdown": req.body.q,
            "body": converter.makeHtml(req.body.q),
        }
        model.posts.insertOne(new_ask).then(result => {
            req.io.emit('sending_notification', new_ask.title);
            console.log('sending_notification');
            console.log("inserted");
            if(id!=0){
                model.users.updateOne({"id":id},{ $inc: { "questionCount": 1}}).then(result => {
                    res.redirect(`/${parseInt(req.params.id)}`);
                    req.io.emit('refresh');

                    res.redirect(`/questions/${parseInt(new_ask.id)}`);
                });
            } else {
                res.redirect(`/questions/${new_ask.id}`);
                req.io.emit('refresh');
            }
        });
    });
});

// router.put("/up/:id", (req, res) => {
//     let requestedId = parseInt(req.params.id);
//     console.log(req.params.id);
//     let id = { id: requestedId };
//     model.posts.updateOne(id, { $inc: { "score": +1 } }).then(x => {
//         model.posts.findOne(id).then(result => {
//             let newpath = '/questions/'
//             if (result.postType == "answer") {
//                 newpath = newpath + JSON.stringify(result.parentId);
//             } else {
//                 newpath = newpath + JSON.stringify(result.id);
//             }
//             console.log(newpath);
//             if (result.ownerUserId != 0) {
//                 model.users.updateOne({ "id": result.ownerUserId }, { $inc: { "reputation": +1 } }).then(result => {
//                     res.redirect(newpath);
//                 });
//             } else {
//                 res.redirect(newpath);
//             }
//         });
//     });
// });

// check if the user is authenticated. if he is, he can vote, else not 
router.put("/up/:id", (req, res) => {
    let requestedId = parseInt(req.params.id);
    console.log(req.params.id);
    let id = { id: requestedId };
    if (req.isAuthenticated()) {
        model.posts.updateOne(id, { $inc: { "score": +1 } }).then(x => {
            model.posts.findOne(id).then(result => {
                let newpath = '/questions/'
                if (result.postType == "answer") {
                    newpath = newpath + JSON.stringify(result.parentId);
                } else {
                    newpath = newpath + JSON.stringify(result.id);
                }
                console.log(newpath);
                if (result.ownerUserId != 0) {
                    model.users.updateOne({ "id": result.ownerUserId }, { $inc: { "reputation": +1 } }).then(result => {
                        res.redirect(newpath);
                    });
                } else {
                    res.redirect(newpath);
                }
            });
        });
    } else {
        alert("You cannot vote for questions as an anonymous user");
        req.flash('error', 'You cannot vote for questions as an anonymous user')
        console.error("You cannot vote for questions as an anonymous user");
        res.redirect(`/questions/${requestedId}`);
    }
});


// router.put("/down/:id", (req, res) => {
//     let requestedId = parseInt(req.params.id);
//     console.log("requested id is: ", req.params.id);
//     let id = { id: requestedId };
//     console.log("downvote id", id);
//     model.posts.updateOne(id, { $inc: { "score": -1 } }).then(x => {
//         model.posts.findOne(id).then(result => {
//             let newpath = '/questions/'
//             if (result.postType == "answer") {
//                 newpath = newpath + JSON.stringify(result.parentId);
//             } else {
//                 newpath = newpath + JSON.stringify(result.id);
//             }
//             console.log("what is newpath???", newpath);
//             if (result.ownerUserId != 0) {
//                 model.users.updateOne({ "id": result.ownerUserId }, { $inc: { "reputation": -1 } }).then(result => {
//                     res.redirect(newpath);
//                 });
//             } else {
//                 res.redirect(newpath);
//             }
//         });
//     });
// });


// check if the user is authenticated. if he is, he can vote, else not 
router.put("/down/:id", (req, res, event) => {
    let requestedId = parseInt(req.params.id);
    console.log("requested id is: ", req.params.id);
    let id = { id: requestedId };
    console.log("downvote id", id);
    // TODO:
    // if (new_users ==  req.user.id) {
    //     console.log(req.user.id, "for the id")
    //     console.log("new_users", new_users)
    //     console.error("You cannot vote for your own questions");
    //     req.flash('error', 'You cannot vote for your own questions')
    //     res.redirect(`/questions/${requestedId}`);
    // } else {
    //     console.log("skipped if ")
    // }
    if (req.isAuthenticated()) {
        model.posts.updateOne(id, { $inc: { "score": -1 } }).then(x => {
            model.posts.findOne(id).then(result => {
                let newpath = '/questions/'
                if (result.postType == "answer") {
                    newpath = newpath + JSON.stringify(result.parentId);
                } else {
                    newpath = newpath + JSON.stringify(result.id);
                }
                console.log("what is newpath???", newpath);
                if (result.ownerUserId != 0) {
                    model.users.updateOne({ "id": result.ownerUserId }, { $inc: { "reputation": -1 } }).then(result => {
                        res.redirect(newpath);
                    });
                } else {
                    res.redirect(newpath);
                }
            });
        });
    } else {
        alert("You cannot vote for questions as an anonymous user");
        req.flash('error', 'You cannot vote for questions as an anonymous user')
        console.error("You cannot vote for questions as an anonymous user");
        res.redirect(`/questions/${requestedId}`);
    }


});