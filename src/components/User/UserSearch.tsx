import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, User, MessageCircle } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import axios from 'axios';
import toast from 'react-hot-toast';

const base_url = 'https://shareable-io-bfl5.onrender.com'

interface UserSearchProps {
  onClose: () => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${base_url}/api/users/search?q=${query}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to search users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (user: any) => {
    // This would open a direct message or create todo for the user
    toast.success(`Feature coming soon! You selected @${user.username}`);
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
        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden border border-white/20"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Find Users</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="w-4 h-4" />}
          />
        </div>

        <div className="p-6">
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search by username or name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              icon={Search}
            />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            )}

            {!loading && searchQuery.length >= 2 && users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No users found</p>
              </div>
            )}

            {!loading && searchQuery.length < 2 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Start typing to search for users</p>
              </div>
            )}

            {users.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/30 hover:bg-white/70 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {user.displayName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{user.displayName}</h3>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    {user.bio && (
                      <p className="text-xs text-gray-500 mt-1">{user.bio}</p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSendMessage(user)}
                  icon={<MessageCircle className="w-4 h-4" />}
                >
                  Message
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserSearch;