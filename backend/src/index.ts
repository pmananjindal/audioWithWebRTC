import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import multer from "multer";
import { roomHandler } from "./room";
const PORT = 8080;
const app = express();
// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req);
    console.log(file);
    cb(null, "uploads"); // Directory to save the uploaded files
  },
  filename: (req, file, cb) => {
    console.log(req);
    cb(null, `${Date.now()}-${file.originalname}`); // Set filename with timestamp
  },
});
const upload = multer({ storage });
app.use(cors);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// io.on("connection", (socket) => {
//   console.log("user is connected");
//   roomHandler(socket);
//   socket.on("disconnect", () => {
//     console.log("user is disconnected");
//   });
// });
app.post("/upload", upload.single("audio"), (req: Request, res: Response) => {
  const file: any = req?.file;
  console.log(file);
  if (file) {
    // File is stored in 'uploads' directory
    console.log("Received file:", file);

    // Process the file (e.g., save to database, process audio, etc.)
    res.send("File uploaded successfully");
  } else {
    res.status(400).send("No file uploaded");
  }
});
server.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
