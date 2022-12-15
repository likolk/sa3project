socket.on('sending_notification', function(data) {
    iziToast.show({
        title: 'Anoymous has posted a new question!',
        message: data.title,
        position: 'topRight',
        buttons: [
            ['<button>View</button>', function (instance, toast) {
                window.location.href = "/questions/" + data.id
            }],
        ],
        maxWidth: 400,
        transitioIn: 'fadeInDown',
    });
})

socket.on('refresh', () => {
    //check if the page is the home page
    console.log('refreshed page' +
        '')
    if (window.location.pathname == "/") {
        //reload the list of questions in the main-content class using fetch
    //     <div class="main-content">

    //     <% posts.forEach(post => { %>
    //         <div class="d1">
    //             <a class="linkQ" href="/questions/<%- post.id %>">
    //                 <div class="d">
    //                     <div class="dtitle">
    //                         <p class="styleT"><span class="styleT"> <%= post.title %> </span></p>
    //                     </div>
    //                     <div class="dscore">
    //                         <p class="stylediv"><span> score: <%= post.score %> </span></p>
    //                     </div>
    //                     <div class="dcount">
    //                         <p class="stylediv"><span> answers: <%= post.answerCount %> </span></p>
    //                     </div>
    //                     <div class="ddate">
    //                         <p class="stylediv"><span><%= new Date(post.creationDate).toUTCString().split('G')[0] %> </span></p>
    //                     </div>
    //                     <div class="dtag">
    //                         <% post.tags.split("|").forEach(tag =>{ %>

    //                             <% if (tag != ''){%> 
    //                             <div class="styletag">
    //                                 <span><%- tag %></span>
    //                             </div>   
    //                             <%}%> 
    //                         <% }) %>
    //                     </div>
    //                     <div class="duser">
    //                         <p><span>
    //                             <% if(post.ownerUserId ==0){%>
    //                             Anonymous
    //                             <% } else { %>
    //                                 <%- users.find(e => e.id === post.ownerUserId).displayName %>
    //                             <%}%>
    //                         </span></p>
    //                     </div>
    //                 </div>
    //             </a>
    //         </div>
    //     <% }); %>
    // </div>
        fetch('/questions').then(res => res.json()).then(posts => {
            const html = posts.map(post => {
                return `
                <div class="d1">
                    <a class="linkQ" href="/questions/${post.id}">
                        <div class="d">
                            <div class="dtitle">
                                <p class="styleT"><span class="styleT"> ${post.title} </span></p>
                            </div>
                            <div class="dscore">
                                <p class="stylediv"><span> score: ${post.score} </span></p>
                            </div>
                            <div class="dcount">
                                <p class="stylediv"><span> answers: ${post.answerCount} </span></p>
                            </div>
                            <div class="ddate">
                                <p class="stylediv"><span>${new Date(post.creationDate).toUTCString().split('G')[0]} </span></p>
                            </div>
                            <div class="dtag">
                                ${post.tags.split("|").map(tag => {
                                    if (tag != '') {
                                        return `
                                        <div class="styletag">
                                            <span>${tag}</span>
                                        </div>   
                                        `
                                    }
                                }).join('')}
                            </div>
                            <div class="duser">
                                <p><span>
                                    ${"Anonymous"}
                                </span></p>
                            </div>
                        </div>
                    </a>
                </div>
                `
            }).join('')
            document.querySelector('.main-content').innerHTML = html
        }
        )
    }
})