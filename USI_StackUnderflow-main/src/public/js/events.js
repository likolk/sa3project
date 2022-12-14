socket.on('sending_notification', function (data) {
    console.log('sending_notification', data);
    iziToast.info({
        title: 'Anoymous has posted a new question!',
        message: data,
        position: 'topRight',
        maxWidth: 400,
        transitioIn: 'fadeInDown',
    });
});

socket.on('refresh', () => {
    //check if the oage is the home page
    if (window.location.pathname == "/") {
        //reload the list of questions in the main-content class using fetch
        fetch('/questions').then(response => response.json()).then(posts => {
            //clear the list of questions
            document.querySelector('.main-content').innerHTML = '';
            //add the new list of questions
            posts.forEach(post => {
                const div = document.createElement('div');
                div.classList.add('d1');
                const a = document.createElement('a');
                a.classList.add('linkQ');
                a.href = `/questions/${post.id}`;
                const p = document.createElement('p');
                const span = document.createElement('span');
                span.classList.add('styleT');
                span.innerHTML = post.title;
                p.appendChild(span);
                a.appendChild(p);
                div.appendChild(a);
                document.querySelector('.main-content').appendChild(div);
            });

        });
    }
});