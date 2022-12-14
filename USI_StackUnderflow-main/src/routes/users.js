const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require("fs-extra");
const { ensureAuthenticated } = require('../../config/auth');
const expresslayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash   = require('connect-flash');
const session   =  require('express-session');
const bcrypt = require("bcryptjs");
const passport = require('passport');
module.exports = router;
const {model} = require("../../model");


// router.get('/', (req, res) => {
//     res.render('users.ejs');
// });

// router.get('/:id', (req, res) => {
//     res.render('profile.ejs');
// });


const User = require('../../model/Users');
const { monitorEventLoopDelay } = require('perf_hooks');

router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        console.log("we are here")
        // model.posts.find({}).toArray().then(posts => {
        //     res.render("index", {
        //         posts: posts
        //     });
        // })
        res.render("index", { 'logged': req.isAuthenticated() });
    } else {
        console.log("we are in the e;lse");
        res.render("welcome");
    };
});

// router.get("/dashboard", ensureAuthenticated, (req, res) => {
//     res.render("dashboard",
//         { name: req.user.name }

//     );
// });

router.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        console.log("we are here")
        res.render("/");
    } else {
        console.log("we are in the e;lse");
        res.render("login");
    };
})


// registration  page 
router.get("/register", (req, res) => {
    res.render("register");
});

// register
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    if (!name || !email || !password || !password2) {
        errors.push({ msg: "Missing fields" });
    }
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 5) {
        errors.push({ msg: "Please ensure your password is of at least 5 characters" });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else {
        // validation passed
        model.users.find({}).toArray()
            .then(user => {
                if (user.find(e=>e.email === email)) {
                    errors.push({ msg: 'User Already Exists' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });

                } else {
                    let newUser = {
                        "answerCount": 0,
                        "questionCount": 0,
                        "goldBadges": 0,
                        "silverBadges": 0,
                        "bronzeBadges": 0,
                        "views": 0,
                        "reputation": 0,
                        "id": user.length,
                        "accountId": Math.floor(Math.random() * (30000000 - 10000000) + 10000000),
                        "displayName": name,
                        "email": email,
                        "password": password
                    };
                    // hash password
                    bcrypt.genSalt(2, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) {
                                res.send(err);
                            } else {
                                newUser.password = hash;
                            }
                            // save the user
                            model.users.insertOne(newUser)
                                .then(user => {
                                    // send success msg to login page
                                    req.flash('success_msg', 'You Are now registered. Please proceed with logging in')
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));

                        }))
                }
            })
    }
});

// login handle

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});


// logout 

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/users/login');
      });
    // req.flash('success_msg', "you are logged out");
    // res.redirect('/users/login');
})


// const express = require('express');
// const router = express.Router();
// module.exports = router;
// const models = require('../model/index.js').model;

// router.get('/', (req, res) => {
//     models['users'].find({}).toArray().then((users) => {
//         res.format({
//             'application/json': () => {
//                 res.json(users);
//             }
//         })
//     })
// });

// router.get('/:id', (req, res) => {
//     const id = req.params.id;
//     models['users'].find({ _id: id }).toArray().then((users) => {
//         res.format({
//             'application/json': () => {
//                 res.json(users);
//             }
//         })
//     })
// })
router.post("/confirm", (req, res) => {
    const password = req.body.password;
    const password2 = req.body.password2;   
    console.log("passwords:")
    console.log("hahahahaha", password)

    console.log("fuck off", password2)
    let errors = [];
    if (!password) {
        errors.push({ msg: "Missing fields" });
    }
    // TODO: why is password2 undefined???????????????
    if (password !== password2) {
        errors.push({ msg: "Passwords do not match" });
    }
    if (password.length < 5) {
        errors.push({
            msg: "Please ensure your password is of at least 5 characters",
        });
    }

    if (errors.length > 0) {
        console.log("found errore")
        res.render("register", {
            errors,
            password,
            password2,
        });
    } else {
        console.log("no errors found")
        const token =
            req.params.token ||
            req.body.token ||
            req.query.token ||
            req.headers["x-access-token"];
            
        console.log("token", token);
        model.users
            .find({
                resetToken: token,
                resetTokenExpiration: { $gt: Date.now() },
            })
            .toArray()
            .then((user) => {
                if (user.length === 0) {
                    req.flash("error", "Password reset token is invalid or has expired.");
                    res.redirect("/users/login");
                } else {
                    // hash password
                    bcrypt.genSalt(2, (err, salt) =>
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) {
                                res.send(err);
                            } else {
                                // update the password
                                model.users
                                    .updateOne(
                                        {
                                            resetToken: token,
                                            resetTokenExpiration: { $gt: Date.now() },
                                        },
                                        {
                                            $set: {
                                                password: hash,
                                                resetToken: null,
                                                resetTokenExpiration: null,
                                            },
                                        }
                                    )
                                    .then((result) => {
                                        req.flash("success_msg", "Password updated successfully");
                                        res.redirect("/");
                                    });
                            }
                        })
                    );
                }
            });
    }
});

router.get("/users_list", (req, res) => {
    // sort the list of users based on 
    // the number of questions they have asked
    console.log("sorting userrrrrs");
    model.users.find({}).sort({questionCount: -1}).toArray().then(users => {
        res.render('users_list', {users, layout: false});
    })
    console.log("sorted users");
});

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await model.users.findOne({id});
    const accountId = user.accountId;
    console.log(accountId);
    const badge = await model.badges.findOne({id}); // undifined... why?
    const account = await model.accounts.findOne({accountId}); // undifined... why?
    const questions = await model.posts.find({postType: "question"}).toArray();
    const user_answers = await model.posts.find({ownerUserId: id, postType: "answer"}).toArray();
    

    // console.log(user_questions);
    res.render('user_profile', {user, account, badge, questions, user_answers, layout: false});
});
