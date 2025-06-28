import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TodoItem from './TodoItem';

interface Todo {
  _id: string;
  content: string;
  createdBy: {
    _id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  assignedTo?: {
    _id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  dueDate?: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  tags: string[];
  isShared: boolean;
  conversation: Array<{
    _id: string;
    user: {
      _id: string;
      username: string;
      displayName: string;
      avatar: string;
    };
    message: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  onTodoUpdated: (todo: Todo) => void;
  onTodoDeleted: (todoId: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  loading,
  onTodoUpdated,
  onTodoDeleted,
}) => {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-12 border border-white/20 text-center">
        <div className="text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No todos yet</h3>
          <p>Create your first todo or get assigned one by a friend!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {todos.map((todo) => (
          <motion.div
            key={todo._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TodoItem
              todo={todo}
              onUpdated={onTodoUpdated}
              onDeleted={onTodoDeleted}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TodoList;