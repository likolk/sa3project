function load_header() {
    console.log("header loaded");
    document.querySelector("header").innerHTML = ejs.views_includes_header({ 'logged': true});
}
function load_nav() {
    console.log("nav loaded");
    document.querySelector("nav").innerHTML = ejs.views_includes_nav({'logged': true});

    document.querySelector("#home")

    document.querySelectorAll("nav a").forEach(link => {
        link.addEventListener("click", (e)=>{
            e.preventDefault();

            let url = new URL(e.currentTarget.href);

            switch(url.pathname) {
                case '/':
                    load_index();
                    break;
                // case '/users/logout' || '/users/login':
                //     // dipende da use logged
                //     break
                // case '/users':
                //     // dipende da use logged !!! attenzione /users e' la route che corrisponde a /users/login scritta a linea 22!
                //     break
                case '/users/users_list':
                    load_users_list();
                    break;
                case '/tags':
                    load_tags();
                    break;
                case '/questions/ask':
                    // load_questions();
                    ask_new_question();
                default:
                    break;
            };
        });
    })
}
function load_index() {
    api.get_all_posts().then((data) => {
        let posts = data.posts;
        let users = data.users;
        document.querySelector("main").innerHTML = ejs.views_index({"posts": posts, "users": users});
        document.querySelectorAll("main a").forEach(link => {
            // console.log("link", link);
            link.addEventListener("click", (e)=>{
                e.preventDefault();
                let url = new URL(e.currentTarget.href);
                let id = url.pathname.split("/")[2];
                load_questions(id);
            });
        });
    })
}

function load_users_list() {
    api.get_all_users().then(users => {    
        document.querySelector("main").innerHTML = ejs.views_users_list({"users": users});
        document.querySelectorAll("main a").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                let url = new URL(e.currentTarget);
                let id = url.pathname.split("/")[2];
                load_user_profile(id);                
            })
        })
    })
}

function load_user_profile(id) {
    api.get_stuff(id).then((data) => {
        const user = data.user;
        const account = data.account;
        const badge = data.badge;
        const questions = data.questions;
        const user_answers = data.user_answers;
        const layout = data.layout;
        document.querySelector("main").innerHTML = ejs.views_user_profile({user, account, badge, questions, user_answers, layout});

        document.querySelectorAll("main a").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                let url = new URL(e.currentTarget);
                let id = url.pathname.split("/")[2];
                
                load_questions(id);
            })
        })
    })
}

function load_tags() {
    api.get_all_tags().then(tags => {
        document.querySelector("main").innerHTML = ejs.views_tags({"tags": tags, 'logged': true});
        document.querySelectorAll("main a").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                let url = new URL(e.currentTarget);
                let name = url.pathname.split("/")[2];
                load_questions_by_tags(name);
            })
        })
    });
}

function load_questions_by_tags(name) {
    api.get_questions_by_tags(name).then((data) => {
        const posts = data.posts;
        const layout = data.layout;
        document.querySelector("main").innerHTML = ejs.views_tags_name({posts, layout, 'logged': true});
        document.querySelectorAll("main a").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                let url = new URL(e.currentTarget);
                let id = url.pathname.split("/")[2];
                load_questions(id);
            })
        })
    })
}

function ask_new_question() {
    document.querySelector("main").innerHTML = ejs.views_newQuestion({layout: false});
    let form = document.querySelector("main .nq form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let form_data = {
            "t": document.querySelector("main .nq form input[name='t']").value,
            "q": document.querySelector("main .nq form textarea[name='q']").value,
            "tags": document.querySelector("main .nq form input[name='tags']").value,
        }
        api.post_question(form_data).then((id) => {
            // console.log("id question:", id)
            load_questions(id);
        });
    });
}

function load_questions(id) {
    api.get_question(id).then((data) => {
        let question = data.question;
        let answers = data.answers;
        let users = data.users;
        document.querySelector("main").innerHTML = ejs.views_questions({question, answers, users});

        let form = document.querySelector("main form.answer");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            let form_data = {
                "answer": document.querySelector("main form.answer textarea[name='answer']").value,
            }
            api.post_answer(id, form_data).then((id) => {
                // console.log("id answer:", id)
                load_questions(id);
            });

        });
    });
}
// not utilized yet
// just for debugging
function load_question() {
    document.querySelector("main").innerHTML = ejs.views_question({layout: false, 'logged': true});
}


function init() {
    load_header();
    load_index();
    load_nav();
}