import { Socket } from "socket.io";
// import { v4 as uuidV4 } from "uuid";
export const roomHandler = (socket: Socket) => {
  socket.on("offer", (offer) => {
    console.log("in offer", offer);
    socket.broadcast.emit("offer", offer);
  });
  socket.on("answer", (answer) => {
    console.log("in answer", answer);
    socket.broadcast.emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    console.log("in candidate", candidate);
    socket.broadcast.emit("ice-candidate", candidate);
  });
  //   const createRoom = () => {
  //     const roomId = uuidV4();
  //     socket.join(roomId);
  //     socket.emit("room-created", { roomId });
  //     console.log("user created the room");
  //   };
  //   const joinRoom = () => {
  //     console.log("user joined the room");
  //   };

  //   socket.on("create-room", createRoom);
  //   socket.on("join-room", joinRoom);
};
