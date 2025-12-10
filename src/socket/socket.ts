/* eslint-disable no-console */
import { io } from "socket.io-client";

const endPoint = import.meta.env.VITE_API_WS_URL;

// Configure the socket with aggressive reconnection settings
const socket = io(endPoint, {
  path: "/socket.io",
  autoConnect: false, // We'll manually connect when needed
  reconnection: true,
  reconnectionAttempts: 25, // More retry attempts
  reconnectionDelay: 500, // Start with shorter delay
  reconnectionDelayMax: 3000, // Max delay reduced for faster reconnection
  timeout: 30000, // Increased timeout
  transports: ['websocket', 'polling'],
  forceNew: true, // Create a new connection each time
  multiplex: false, // Ensure we don't reuse connections
  upgrade: true, // Allow transport upgrades
  extraHeaders: { // Add a timestamp to force uniqueness
    'Cache-Control': 'no-cache',
    'Unique-Connection-Id': Date.now().toString(),
    'Force-Logout-Support': 'true'
  }
});

// Log socket lifecycle events for debugging
socket.on('connect', () => {
  // Send ping immediately on connect to verify connection
  socket.emit('pingCheck');
  console.log(`Client socket connected: ${socket.id}`, new Date());
});

socket.on('pongCheck', () => {
  console.log("WebSocket is healthy.", socket.id);
});

socket.on('disconnect', (reason) => {
  console.log(`Frontend: Socket disconnected: ${reason}`, socket.id, new Date());
  
  // Detect abnormal disconnections that might need intervention
  if (reason === 'io server disconnect' || reason === 'io client disconnect') {
    // These are intentional disconnects, nothing to do
    console.log("Socket was intentionally disconnected");
  } else {
    // Unintentional disconnect
    console.log("Socket was unintentionally disconnected:", reason);
  }
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error, socket.id);
});

socket.on('error', (error) => {
  console.error('Socket error:', error, socket.id);
});

// Export the socket instance
export default socket;