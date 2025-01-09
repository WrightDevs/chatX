import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static('public'));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public/index.html'));
});

// Store connected users
const users = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user joining
  socket.on('join', (username) => {
    users.set(socket.id, username);
    io.emit('userJoined', {
      username,
      users: Array.from(users.values()),
      message: `${username} joined the chat`
    });
  });

  // Handle chat messages
  socket.on('chatMessage', (message) => {
    const username = users.get(socket.id);
    io.emit('message', {
      username,
      text: message,
      time: new Date().toLocaleTimeString()
    });
  });

  // Handle typing status
  socket.on('typing', () => {
    const username = users.get(socket.id);
    socket.broadcast.emit('userTyping', username);
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('userStoppedTyping');
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      io.emit('userLeft', {
        username,
        users: Array.from(users.values()),
        message: `${username} left the chat`
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});