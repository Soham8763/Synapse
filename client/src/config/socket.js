import io from 'socket.io-client';

let socket = null;

export const initializeSocket = (projectId, token) => {
  if (!projectId) {
    console.error('initializeSocket: No projectId provided');
    return null;
  }

  if (!token) {
    console.error('initializeSocket: No authentication token provided');
    return null;
  }

  if (socket) {
    console.log(`initializeSocket: Disconnecting previous socket for project: ${projectId}`);
    socket.disconnect();
  }

  const serverUrl = 'http://localhost:3000'; // Replace with your actual server URL
  console.log(`initializeSocket: Connecting to ${serverUrl} with projectId: ${projectId}, token: ${token.slice(0, 10)}...`);
  socket = io(serverUrl, {
    query: { projectId },
    auth: { token }, // Send JWT token in auth object
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log(`Socket connected: ${socket.id} for project: ${projectId}`);
  });

  socket.on('connect_error', (error) => {
    console.error(`Socket connection error: ${error.message}`, { error, token: token.slice(0, 10) + '...' });
  });

  socket.on('room-joined', ({ projectId: joinedProjectId }) => {
    console.log(`Successfully joined room: ${joinedProjectId}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket server error: ${error.message}`, error);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${reason}`);
  });

  return socket;
};

export const sendMessage = (event, data) => {
  if (!socket || !socket.connected) {
    console.error(`sendMessage: Socket not initialized or not connected for event: ${event}`);
    return;
  }
  console.log(`sendMessage: Emitting ${event} with data:`, data);
  socket.emit(event, data);
};

export const recieveMessage = (event, callback) => {
  if (!socket) {
    console.error(`recieveMessage: Socket not initialized for event: ${event}`);
    return;
  }
  console.log(`recieveMessage: Setting up listener for ${event}`);
  socket.off(event); // Remove previous listeners to prevent duplicates
  socket.on(event, (data) => {
    console.log(`recieveMessage: Received ${event}:`, data);
    callback(data);
  });
};