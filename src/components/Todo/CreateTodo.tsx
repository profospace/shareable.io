import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, User, Hash, Send } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';
import axios from 'axios';
import toast from 'react-hot-toast';
import "react-datepicker/dist/react-datepicker.css";

const base_url = 'https://shareable-io-bfl5.onrender.com'


interface CreateTodoProps {
  onClose: () => void;
  onTodoCreated: (todo: any) => void;
}

const CreateTodo: React.FC<CreateTodoProps> = ({ onClose, onTodoCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setUserSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(`${base_url}/api/users/search?q=${query}`);
      setUserSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleAssignedToChange = (value: string) => {
    setAssignedTo(value);
    if (value.startsWith('@')) {
      searchUsers(value.substring(1));
    } else {
      setShowSuggestions(false);
    }
  };

  const selectUser = (username: string) => {
    setAssignedTo(`@${username}`);
    setShowSuggestions(false);
    setUserSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please enter todo content');
      return;
    }

    setLoading(true);
    try {
      const todoData = {
        content: content.trim(),
        assignedTo: assignedTo.trim() || null,
        dueDate: dueDate ? dueDate.toISOString() : null,
        dueTime: dueTime.trim() || null,
        priority,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      };

      const response = await axios.post(`${base_url}/api/todos`, todoData);
      onTodoCreated(response.data);
      toast.success('Todo created successfully!');
    } catch (error: any) {
      console.error('Failed to create todo:', error);
      toast.error(error.response?.data?.message || 'Failed to create todo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Todo</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="w-4 h-4" />}
          />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What needs to be done?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your todo..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:outline-none transition-colors resize-none"
              required
            />
          </div>

          {/* Assign To */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to (optional)
            </label>
            <Input
              type="text"
              value={assignedTo}
              onChange={(e) => handleAssignedToChange(e.target.value)}
              placeholder="@username or leave empty for yourself"
              icon={User}
            />
            {showSuggestions && userSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                {userSuggestions.map((suggestion) => (
                  <button
                    key={suggestion._id}
                    type="button"
                    onClick={() => selectUser(suggestion.username)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {suggestion.displayName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{suggestion.displayName}</p>
                      <p className="text-sm text-gray-500">@{suggestion.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (optional)
              </label>
              <div className="relative">
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => setDueDate(date)}
                  minDate={new Date()}
                  placeholderText="Select date"
                  className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:outline-none"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Time (optional)
              </label>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                icon={Clock}
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optional)
            </label>
            <Input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, personal, urgent (comma separated)"
              icon={Hash}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              icon={<Send className="w-4 h-4" />}
            >
              Create Todo
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateTodo;