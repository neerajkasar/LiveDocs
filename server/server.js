require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const Document = require('./models/document.model');

const PORT = process.env.PORT || 3001;

connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/documents', require('./routes/document.routes'));


const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, restrict this to your frontend's URL
    methods: ["GET", "POST"]
  }
});

const documentSaveInterval = 2000; // Save document every 2 seconds after a change

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-document', (documentId) => {
    socket.join(documentId);
    console.log(`User ${socket.id} joined document ${documentId}`);
  });

  socket.on('doc-change', (delta, documentId) => {
    socket.to(documentId).emit('receive-changes', delta);
  });

  socket.on('save-document', async (data) => {
    try {
        await Document.findByIdAndUpdate(data.documentId, { content: data.content });
        console.log(`Document ${data.documentId} saved.`);
    } catch(err) {
        console.error("Error saving document:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});