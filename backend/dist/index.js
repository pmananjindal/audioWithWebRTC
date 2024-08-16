"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const PORT = 8080;
const app = (0, express_1.default)();
// Configure multer
const storage = multer_1.default.diskStorage({
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
const upload = (0, multer_1.default)({ storage });
app.use(cors_1.default);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
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
app.post("/upload", upload.single("audio"), (req, res) => {
    const file = req === null || req === void 0 ? void 0 : req.file;
    console.log(file);
    if (file) {
        // File is stored in 'uploads' directory
        console.log("Received file:", file);
        // Process the file (e.g., save to database, process audio, etc.)
        res.send("File uploaded successfully");
    }
    else {
        res.status(400).send("No file uploaded");
    }
});
server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
