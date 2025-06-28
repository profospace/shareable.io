import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  User, 
  MoreVertical, 
  Check, 
  Edit, 
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';
import axios from 'axios';
import toast from 'react-hot-toast';

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

interface TodoItemProps {
  todo: Todo;
  onUpdated: (todo: Todo) => void;
  onDeleted: (todoId: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdated, onDeleted }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const isOwner = todo.createdBy._id === user?.id;
  const isAssigned = todo.assignedTo?._id === user?.id;
  const canEdit = isOwner || isAssigned;

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const handleStatusToggle = async () => {
    if (!canEdit) return;

    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    setLoading(true);

    try {
      const response = await axios.put(`http://localhost:5000/api/todos/${todo._id}`, {
        status: newStatus
      });
      onUpdated(response.data);
      toast.success(`Todo ${newStatus === 'completed' ? 'completed' : 'reopened'}!`);
    } catch (error) {
      console.error('Failed to update todo status:', error);
      toast.error('Failed to update todo status');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/todos/${todo._id}/comments`, {
        message: commentText.trim()
      });
      onUpdated(response.data);
      setCommentText('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner || !confirm('Are you sure you want to delete this todo?')) return;

    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/todos/${todo._id}`);
      onDeleted(todo._id);
      toast.success('Todo deleted!');
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast.error('Failed to delete todo');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'completed';

  return (
    <motion.div
      className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden ${
        todo.status === 'completed' ? 'opacity-75' : ''
      } ${isOverdue ? 'ring-2 ring-red-200' : ''}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                {todo.createdBy.displayName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {todo.createdBy.displayName}
                  <span className="text-gray-500 text-sm ml-1">@{todo.createdBy.username}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(todo.createdAt), 'MMM d, yyyy • h:mm a')}
                </p>
              </div>
            </div>

            <div className={`text-gray-900 mb-4 ${todo.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
              {todo.content}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[todo.priority]}`}>
                {todo.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[todo.status]}`}>
                {todo.status.replace('-', ' ')}
              </span>
              
              {todo.assignedTo && (
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <User className="w-3 h-3" />
                  <span>@{todo.assignedTo.username}</span>
                </div>
              )}

              {todo.dueDate && (
                <div className={`flex items-center space-x-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(todo.dueDate), 'MMM d')}</span>
                  {todo.dueTime && (
                    <>
                      <Clock className="w-3 h-3 ml-1" />
                      <span>{todo.dueTime}</span>
                    </>
                  )}
                  {isOverdue && <AlertCircle className="w-3 h-3 text-red-500" />}
                </div>
              )}

              {todo.conversation.length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <MessageSquare className="w-3 h-3" />
                  <span>{todo.conversation.length} comments</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {canEdit && (
                  <Button
                    size="sm"
                    variant={todo.status === 'completed' ? 'outline' : 'primary'}
                    onClick={handleStatusToggle}
                    loading={loading}
                    icon={<Check className="w-4 h-4" />}
                  >
                    {todo.status === 'completed' ? 'Reopen' : 'Complete'}
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpanded(!expanded)}
                  icon={expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                >
                  {expanded ? 'Less' : 'More'}
                </Button>
              </div>

              {isOwner && (
                <div className="relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowActions(!showActions)}
                    icon={<MoreVertical className="w-4 h-4" />}
                  />
                  {showActions && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border z-10">
                      <button
                        onClick={() => {/* Handle edit */}}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            {/* Comments */}
            {todo.conversation.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {todo.conversation.map((comment) => (
                    <div key={comment._id} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {comment.user.displayName[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{comment.user.displayName}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Comment */}
            <form onSubmit={handleAddComment} className="flex space-x-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                loading={loading}
                disabled={!commentText.trim()}
              >
                Send
              </Button>
            </form>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TodoItem;