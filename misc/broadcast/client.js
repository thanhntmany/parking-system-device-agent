const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

socket.on('listening', function () {
	socket.setBroadcast(true);
    setInterval(() => {
        const msg = 'Server ' + Math.ceil(Math.random() * 1000);
        console.log("<<Send:", msg)
        const buff = Buffer.from(msg);
		socket.send(buff, 0, buff.length, 5555, '255.255.255.255');
	}, 3000);
});

socket.on('message', function (message, remote) {
	console.log('    >>received from ', remote.address + ':' + remote.port +': ' + message);
});

socket.bind('8888');