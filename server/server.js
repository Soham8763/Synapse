import dotenv from 'dotenv'
dotenv.config();
import http from 'http'
import app from "./app.js"
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose"
import projectModel from "./models/project.model.js"

const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: "*",
    }
});
io.use(async (socket, next) => {
    try{
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(new Error('Authentication error'));
        }

        const projectId = socket.handshake.query.projectId;
        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return next(new Error('Invalid projectId'));
        }
        socket.project = await projectModel.findById(projectId);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return next(new Error('Invalid token'));
        }
        socket.user = decoded;
        next();
    } catch (error) {
        next(error)
    }
});

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  const projectId = socket.handshake.query.projectId;
  if (projectId) {
    socket.project = { _id: projectId };
    socket.join(projectId);

    socket.on('project-message', (data) => {
      console.log('Received message:', data);
      socket.broadcast.to(projectId).emit('project-message', data);
    });
  }
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});