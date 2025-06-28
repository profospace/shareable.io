import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
const base_url = 'https://shareable-io-bfl5.onrender.com'

interface SocketContextType {
  socket: Socket | null;
  online: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io(`${base_url}`, {
        query: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setOnline(true);
        newSocket.emit('join-room', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setOnline(false);
      });

      newSocket.on('new-todo', (todo) => {
        toast.success(
          `New todo from @${todo.createdBy.username}: ${todo.content.substring(0, 50)}${todo.content.length > 50 ? '...' : ''}`,
          { duration: 6000 }
        );
      });

      newSocket.on('todo-updated', (todo) => {
        if (todo.status === 'completed') {
          toast.success(`Todo completed: ${todo.content.substring(0, 50)}${todo.content.length > 50 ? '...' : ''}`);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const value = {
    socket,
    online,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};