// route: /questions

const express = require('express');
const router = express.Router();
var ObjectId = require('mongodb').ObjectId;
module.exports = router;
const {model} = require("../model/");
const showdown = require("../public/js/showdown.js");
const converter = new showdown.Converter();
var session = require('web-session');
let alert = require('alert'); 
const new_users = require("../routes/users");

router.get('/ask', (req, res) => {
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
    console.log(id);
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
                        data = {
                            question: question,
                            answers: answers,
                            users: users
                        }
                        // console.log(data);
                        res.json(data);
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
            "up":[0],
            "down":[0]
        }
        model.posts.insertOne(new_ans).then(result => {
            model.posts.updateOne({"id":parseInt(req.params.id)},{ $inc: { "answerCount": 1}}).then(result => {
                console.log("inserted");
                if(id!=0){
                    model.users.updateOne({"id":id},{ $inc: { "answerCount": 1}}).then(result => {
                        // res.redirect(`/questions/${req.params.id}`);
                        res.json(req.params.id);
                    });
                } else {
                    // res.redirect(`/questions/${req.params.id}`);
                    res.json(req.params.id);
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
            "up":[0],
            "down":[0]
        }
        model.posts.insertOne(new_ask).then(result => {
            req.io.emit('sending_notification',{title : new_ask.title, id : new_ask.id});
            console.log("inserted");
            if(id!=0){
                model.users.updateOne({"id":id},{ $inc: { "questionCount": 1}}).then(result => {
                    // res.redirect(`/questions/${parseInt(new_ask.id)}`);
                    res.json(new_ask.id);
                    req.io.emit('refresh')
                });
            } else {
                console.log("id ZEROO:", new_ask.id)
                res.json(new_ask.id);

                req.io.emit('refresh')
            }

        });
    });
});


router.put("/up/:id", (req, res) => {
    let requestedId = parseInt(req.params.id);
    console.log("requested id is: ", req.params.id);
    let id = { id: requestedId };
    console.log("downvote id", id);
    model.posts.findOne(id).then(result => {
        let newpath = '/questions/'
        if (result.postType == "answer") {
            newpath = newpath + JSON.stringify(result.parentId);
        } else {
            newpath = newpath + JSON.stringify(result.id);
        }
        if (req.isAuthenticated()) {
            console.log("checkpoint 1");
            console.log("checkpoint 2");
            console.log("checkpoint 2");
            if(result.hasOwnProperty("up")){
                console.log("checkpoint 3");
                if(!((result.up).find(e=>e === req.user.id)) && result.ownerUserId!=req.user.id){
                    console.log("checkpoint 4");
                    result.up.push(req.user.id);
                    let down = [0];
                    if(result.hasOwnProperty("down")){
                        for(let i = 0; i<result.down.length; i++){
                            if(result.down[i]==req.user.id){
                                result.down[i] = result.down[result.down.length-1];
                                delete result.down.pop();
                            }
                        }
                        down = result.down;
                    } 
                    model.posts.updateOne(id, { $set: { "score": result.score+1, "up": result.up,  "down": down}}).then(x => {
                        console.log("checkpoint 5");
                        if (result.ownerUserId != 0) {
                            model.users.updateOne({ "id": result.ownerUserId }, { $inc: { "reputation": +1 } }).then(result => {
                                res.redirect(newpath);
                            });
                        } else {
                            res.redirect(newpath);
                        }
                    });
                } else {
                    res.redirect(newpath);
                }
            } else if(result.ownerUserId!=req.user.id){
                console.log(req.user.id)
                let down = [0];
                if(result.hasOwnProperty("down")){
                    for(let i = 0; i<result.down.length; i++){
                        if(result.down[i]==req.user.id){
                            result.down[i] = result.down[result.down.length-1];
                            delete result.down.pop();
                        }
                    }
                    down = result.down;
                } 
                model.posts.updateOne(id, { $set: { "score": result.score+1, "up": [req.user.id], "down": down}}).then(x => {
                    console.log("checkpoint 5");
                    let newpath = '/questions/'
                    if (result.ownerUserId != 0) {
                        model.users.updateOne({ "id": result.ownerUserId }, { $inc: { "reputation": +1 } }).then(result => {
                            res.redirect(newpath);
                        });
                    } else {
                        res.redirect(newpath);
                    }
                });
            } else {
                res.redirect(newpath);
            }
        } else {
            alert("You cannot vote for questions as an anonymous user");
            req.flash('error', 'You cannot vote for questions as an anonymous user')
            console.error("You cannot vote for questions as an anonymous user");
            res.redirect(newpath);
        }
    });
});


router.put("/down/:id", (req, res, event) => {
    let requestedId = parseInt(req.params.id);
    console.log("requested id is: ", req.params.id);
    let id = { id: requestedId };
    console.log("downvote id", id);
    model.posts.findOne(id).then(result => {
        let newpath = '/questions/'
        if (result.postType == "answer") {
            newpath = newpath + JSON.stringify(result.parentId);
        } else {
            newpath = newpath + JSON.stringify(result.id);
        }
        if (req.isAuthenticated()) {
            console.log("checkpoint 1");
            console.log("checkpoint 2");
            if(result.hasOwnProperty("down")){
                console.log("checkpoint 3");
                if(!((result.down).find(e=>e === req.user.id)) && result.ownerUserId!=req.user.id){
                    console.log("checkpoint 4");
                    result.down.push(req.user.id);
                    let up = [0];
                    if(result.hasOwnProperty("up")){
                        for(let i = 0; i<result.up.length; i++){
                            if(result.up[i]==req.user.id){
                                result.up[i] = result.up[result.up.length-1];
                                delete result.up.pop();
                            }
                        }
                        up = result.up;
                    } 
                    model.posts.updateOne(id, { $set: { "score": result.score-1, "up": up,  "down": result.down}}).then(x => {
                        console.log("checkpoint 5");
                        if (result.ownerUserId != 0) {
                            model.users.updateOne({ "id": result.ownerUserId }, { $inc: { "reputation": -1 } }).then(result => {
                                res.redirect(newpath);
                            });
                        } else {
                            res.redirect(newpath);
                        }
                    });
                } else {
                    res.redirect(newpath);
                }
            } else if(result.ownerUserId!=req.user.id){
                console.log(req.user.id)
                let up = [0];
                if(result.hasOwnProperty("up")){
                    for(let i = 0; i<result.up.length; i++){
                        if(result.up[i]==req.user.id){
                            result.up[i] = result.up[result.up.length-1];
                            delete result.up.pop();
                        }
                    }
                    up = result.up;
                } 
                model.posts.updateOne(id, { $set: { "score": result.score-1, "up": up, "down": [req.user.id]}}).then(x => {
                    console.log("checkpoint 5");
                    let newpath = '/questions/'
                    if (result.ownerUserId != 0) {
                        model.users.updateOne({ "id": result.ownerUserId }, { $inc: { "reputation": -1 } }).then(result => {
                            res.redirect(newpath);
                        });
                    } else {
                        res.redirect(newpath);
                    }
                });
            } else {
                res.redirect(newpath);
            }
        } else {
            alert("You cannot vote for questions as an anonymous user");
            req.flash('error', 'You cannot vote for questions as an anonymous user')
            console.error("You cannot vote for questions as an anonymous user");
            res.redirect(newpath);
        }
    });
});

