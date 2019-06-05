const io = require('socket.io')();
const http = require('http');

const PORT = process.env.PORT || 6969;
const server = http.createServer();

io.attach(server);

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected.`);

    setTimeout(() => {
        socket.emit('update_comments', {"hello" : "world"})
    }, 10000);

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected.`);
    });
});

server.listen(PORT, () => {
    console.log("Push system started on port " + PORT);
});
