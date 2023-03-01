import { Server } from "socket.io";

const SocketHandler = (req, res) => {
	if (res.socket.server.io) {
		console.log("Socket is already attached");
		return res.end();
	}

	const io = new Server(res.socket.server);
	res.socket.server.io = io;

	io.on("connection", (socket) => {
		socket.on("reqTurn", (data) => {
			const room = JSON.parse(data).room;
			io.to(room).emit("playerTurn", data);
		});

		socket.on("create", (room) => {
			console.log("create");
			socket.join(room);
		});

		socket.on("join", (room) => {
			console.log("join");
			socket.join(room);
			io.to(room).emit("opponent_joined");
		});

		socket.on("reqRestart", (data) => {
			console.log("start");
			const room = JSON.parse(data).room;
			io.to(room).emit("restart");
		});

		socket.on("reqStartGame", (data) => {
			const room = JSON.parse(data).room;
			io.to(room).emit("startGame", data);
		});
		socket.on("reqGameOver", (room) => {
			console.log("game over");
			io.to(room).emit("gameOver");
		});
	});
	return res.end();
};

export default SocketHandler;
