import { io } from 'socket.io-client';

/**
 * Centralized Socket.IO client instance
 * This singleton pattern ensures we have only one connection
 * shared across all components
 */
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
});

// Log connection events for debugging
socket.on('connect', () => {
    console.log('✅ Connected to server:', socket.id);
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

export default socket;
