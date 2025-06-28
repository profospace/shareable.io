import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
    Calendar,
    Clock,
    MessageSquare,
    User,
    Check,
    AlertCircle,
    Send,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
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

interface ChatViewProps {
    todos: Todo[];
    selectedUserId: string | null;
    onTodoUpdated: (todo: Todo) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ todos, selectedUserId, onTodoUpdated }) => {
    const { user } = useAuth();
    const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());
    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Filter todos for the selected user conversation
    const chatTodos = selectedUserId
        ? todos.filter(todo =>
            (todo.createdBy._id === selectedUserId && todo.assignedTo?._id === user?.id) ||
            (todo.createdBy._id === user?.id && todo.assignedTo?._id === selectedUserId) ||
            (todo.createdBy._id === selectedUserId && !todo.assignedTo) ||
            (todo.assignedTo?._id === selectedUserId && todo.createdBy._id === user?.id)
        ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        : [];

    const selectedUser = selectedUserId
        ? todos.find(todo =>
            todo.createdBy._id === selectedUserId || todo.assignedTo?._id === selectedUserId
        )?.createdBy._id === selectedUserId
            ? todos.find(todo => todo.createdBy._id === selectedUserId)?.createdBy
            : todos.find(todo => todo.assignedTo?._id === selectedUserId)?.assignedTo
        : null;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatTodos, expandedTodos]);

    const toggleExpanded = (todoId: string) => {
        setExpandedTodos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(todoId)) {
                newSet.delete(todoId);
            } else {
                newSet.add(todoId);
            }
            return newSet;
        });
    };

    const handleStatusToggle = async (todo: Todo) => {
        const canEdit = todo.createdBy._id === user?.id || todo.assignedTo?._id === user?.id;
        if (!canEdit) return;

        const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
        setLoading(prev => ({ ...prev, [todo._id]: true }));

        try {
            const response = await axios.put(`http://localhost:5000/api/todos/${todo._id}`, {
                status: newStatus
            });
            onTodoUpdated(response.data);
            toast.success(`Todo ${newStatus === 'completed' ? 'completed' : 'reopened'}!`);
        } catch (error) {
            console.error('Failed to update todo status:', error);
            toast.error('Failed to update todo status');
        } finally {
            setLoading(prev => ({ ...prev, [todo._id]: false }));
        }
    };

    const handleAddComment = async (todoId: string) => {
        const commentText = commentTexts[todoId];
        if (!commentText?.trim()) return;

        setLoading(prev => ({ ...prev, [`comment-${todoId}`]: true }));
        try {
            const response = await axios.post(`http://localhost:5000/api/todos/${todoId}/comments`, {
                message: commentText.trim()
            });
            onTodoUpdated(response.data);
            setCommentTexts(prev => ({ ...prev, [todoId]: '' }));
            toast.success('Comment added!');
        } catch (error) {
            console.error('Failed to add comment:', error);
            toast.error('Failed to add comment');
        } finally {
            setLoading(prev => ({ ...prev, [`comment-${todoId}`]: false }));
        }
    };

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

    if (!selectedUserId) {
        return (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-12 border border-white/20 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a user to chat</h3>
                <p className="text-gray-600">Choose a user from the sidebar to view your shared todos</p>
            </div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 h-[calc(100vh-200px)] flex flex-col">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {selectedUser?.displayName[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">{selectedUser?.displayName}</h2>
                        <p className="text-sm text-gray-600">@{selectedUser?.username}</p>
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatTodos.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No shared todos yet</p>
                        <p className="text-sm text-gray-400">Start by creating a todo and assigning it to this user</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {chatTodos.map((todo) => {
                            const isFromMe = todo.createdBy._id === user?.id;
                            const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'completed';
                            const isExpanded = expandedTodos.has(todo._id);
                            const canEdit = todo.createdBy._id === user?.id || todo.assignedTo?._id === user?.id;

                            return (
                                <motion.div
                                    key={todo._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] ${isFromMe ? 'order-2' : 'order-1'}`}>
                                        <div
                                            className={`rounded-2xl p-4 shadow-lg ${isFromMe
                                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                                    : 'bg-white border border-gray-200'
                                                } ${isOverdue ? 'ring-2 ring-red-200' : ''} ${todo.status === 'completed' ? 'opacity-75' : ''
                                                }`}
                                        >
                                            {/* Todo Content */}
                                            <div className={`mb-3 ${todo.status === 'completed' ? 'line-through' : ''}`}>
                                                {todo.content}
                                            </div>

                                            {/* Todo Meta */}
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${isFromMe
                                                        ? 'bg-white/20 text-white border-white/30'
                                                        : priorityColors[todo.priority]
                                                    }`}>
                                                    {todo.priority}
                                                </span>

                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isFromMe
                                                        ? 'bg-white/20 text-white'
                                                        : statusColors[todo.status]
                                                    }`}>
                                                    {todo.status.replace('-', ' ')}
                                                </span>

                                                {todo.assignedTo && (
                                                    <div className={`flex items-center space-x-1 text-xs ${isFromMe ? 'text-white/80' : 'text-gray-600'
                                                        }`}>
                                                        <User className="w-3 h-3" />
                                                        <span>@{todo.assignedTo.username}</span>
                                                    </div>
                                                )}

                                                {todo.dueDate && (
                                                    <div className={`flex items-center space-x-1 text-xs ${isOverdue
                                                            ? 'text-red-300'
                                                            : isFromMe
                                                                ? 'text-white/80'
                                                                : 'text-gray-600'
                                                        }`}>
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{format(new Date(todo.dueDate), 'MMM d')}</span>
                                                        {todo.dueTime && (
                                                            <>
                                                                <Clock className="w-3 h-3 ml-1" />
                                                                <span>{todo.dueTime}</span>
                                                            </>
                                                        )}
                                                        {isOverdue && <AlertCircle className="w-3 h-3 text-red-400" />}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {canEdit && (
                                                        <Button
                                                            size="sm"
                                                            variant={isFromMe ? 'outline' : todo.status === 'completed' ? 'outline' : 'primary'}
                                                            onClick={() => handleStatusToggle(todo)}
                                                            loading={loading[todo._id]}
                                                            className={isFromMe ? 'text-white border-white/30 hover:bg-white/10' : ''}
                                                        >
                                                            <Check className="w-3 h-3 mr-1" />
                                                            {todo.status === 'completed' ? 'Reopen' : 'Complete'}
                                                        </Button>
                                                    )}

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => toggleExpanded(todo._id)}
                                                        className={isFromMe ? 'text-white hover:bg-white/10' : ''}
                                                    >
                                                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                    </Button>
                                                </div>

                                                <span className={`text-xs ${isFromMe ? 'text-white/60' : 'text-gray-500'}`}>
                                                    {format(new Date(todo.createdAt), 'h:mm a')}
                                                </span>
                                            </div>

                                            {/* Expanded Content */}
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-4 pt-4 border-t border-white/20"
                                                >
                                                    {/* Comments */}
                                                    {todo.conversation.length > 0 && (
                                                        <div className="mb-4">
                                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                                {todo.conversation.map((comment) => (
                                                                    <div key={comment._id} className={`text-sm p-2 rounded-lg ${isFromMe ? 'bg-white/10' : 'bg-gray-50'
                                                                        }`}>
                                                                        <div className="flex items-center space-x-2 mb-1">
                                                                            <span className={`font-medium text-xs ${isFromMe ? 'text-white/90' : 'text-gray-700'
                                                                                }`}>
                                                                                {comment.user.displayName}
                                                                            </span>
                                                                            <span className={`text-xs ${isFromMe ? 'text-white/60' : 'text-gray-500'
                                                                                }`}>
                                                                                {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                                                                            </span>
                                                                        </div>
                                                                        <p className={isFromMe ? 'text-white/90' : 'text-gray-700'}>
                                                                            {comment.message}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Add Comment */}
                                                    <div className="flex space-x-2">
                                                        <Input
                                                            type="text"
                                                            placeholder="Add a comment..."
                                                            value={commentTexts[todo._id] || ''}
                                                            onChange={(e) => setCommentTexts(prev => ({
                                                                ...prev,
                                                                [todo._id]: e.target.value
                                                            }))}
                                                            className={isFromMe ? 'bg-white/10 border-white/20 text-white placeholder-white/60' : ''}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleAddComment(todo._id);
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAddComment(todo._id)}
                                                            loading={loading[`comment-${todo._id}`]}
                                                            disabled={!commentTexts[todo._id]?.trim()}
                                                            variant={isFromMe ? 'outline' : 'primary'}
                                                            className={isFromMe ? 'text-white border-white/30 hover:bg-white/10' : ''}
                                                        >
                                                            <Send className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Timestamp */}
                                        <div className={`text-xs text-gray-500 mt-1 ${isFromMe ? 'text-right' : 'text-left'}`}>
                                            {format(new Date(todo.createdAt), 'MMM d, yyyy • h:mm a')}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
                <div ref={chatEndRef} />
            </div>
        </div>
    );
};

export default ChatView;