const io = require('socket.io')();

function init() {

    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.on('sending_notification', (data) => {
            console.log('sending_notification');
            socket.broadcast.emit('notification_sent', data);
        })

        socket.on('disconnect', () => {
            console.log('user disconnected');
        })

    });
}

module.exports.init = init