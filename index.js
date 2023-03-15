import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db/db.js';
import userRoutes from './routes/userRoutes.routes.js';
import projectRoutes from './routes/projectRoutes.routes.js';
import taskRoutes from './routes/taskRoutes.routes.js';

const app = express();
app.use(express.json());

dotenv.config();

connectDB();

const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function(origin, callback) {
        if (whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Error of cors'));
        }
    }
}

app.use(cors(corsOptions));

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`Server running on the ${PORT}`);
});

//Socket.io
import { Server } from 'socket.io';

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
});

io.on('connection', (socket) => {
    console.log('Connect to socket.io');

    //Events SOCKET.IO
    socket.on('open project', (project) => {
        socket.join(project);
    });

    socket.on('new task', (task) => {
        socket.to(task.project).emit('task add', task);
    });

    socket.on('delete task', (task) => {
        const project = task.project;
        socket.to(project).emit('task deleted', task);
    });

    socket.on('update task', (task) => {
        const project = task.project._id;
        socket.to(project).emit('task updated', task);
    });

    socket.on('change state', (task) => {
        const project = task.project._id;
        socket.to(project).emit('new state', task);
    })
});