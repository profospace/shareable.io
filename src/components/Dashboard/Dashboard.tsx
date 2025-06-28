// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Plus, Search, Filter, Bell, Settings, LogOut } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
// import { useSocket } from '../../contexts/SocketContext';
// import TodoList from '../Todo/TodoList';
// import CreateTodo from '../Todo/CreateTodo';
// import UserSearch from '../User/UserSearch';
// import Button from '../UI/Button';
// import Input from '../UI/Input';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// interface Todo {
//   _id: string;
//   content: string;
//   createdBy: {
//     _id: string;
//     username: string;
//     displayName: string;
//     avatar: string;
//   };
//   assignedTo?: {
//     _id: string;
//     username: string;
//     displayName: string;
//     avatar: string;
//   };
//   dueDate?: string;
//   dueTime?: string;
//   priority: 'low' | 'medium' | 'high' | 'urgent';
//   status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
//   tags: string[];
//   isShared: boolean;
//   conversation: Array<{
//     _id: string;
//     user: {
//       _id: string;
//       username: string;
//       displayName: string;
//       avatar: string;
//     };
//     message: string;
//     timestamp: string;
//   }>;
//   createdAt: string;
//   updatedAt: string;
// }

// const Dashboard: React.FC = () => {
//   const { user, logout } = useAuth();
//   const { socket, online } = useSocket();
//   const [todos, setTodos] = useState<Todo[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showCreateTodo, setShowCreateTodo] = useState(false);
//   const [showUserSearch, setShowUserSearch] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
//   const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');

//   useEffect(() => {
//     fetchTodos();
//   }, []);

//   useEffect(() => {
//     if (socket) {
//       socket.on('new-todo', (todo: Todo) => {
//         setTodos(prev => [todo, ...prev]);
//       });

//       socket.on('todo-updated', (updatedTodo: Todo) => {
//         setTodos(prev => prev.map(todo => 
//           todo._id === updatedTodo._id ? updatedTodo : todo
//         ));
//       });

//       return () => {
//         socket.off('new-todo');
//         socket.off('todo-updated');
//       };
//     }
//   }, [socket]);

//   const fetchTodos = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/todos');
//       setTodos(response.data);
//     } catch (error) {
//       console.error('Failed to fetch todos:', error);
//       toast.error('Failed to load todos');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTodoCreated = (newTodo: Todo) => {
//     setTodos(prev => [newTodo, ...prev]);
//     setShowCreateTodo(false);
    
//     // Emit socket event for real-time updates
//     if (socket) {
//       socket.emit('todo-created', newTodo);
//     }
//   };

//   const handleTodoUpdated = (updatedTodo: Todo) => {
//     setTodos(prev => prev.map(todo => 
//       todo._id === updatedTodo._id ? updatedTodo : todo
//     ));
    
//     // Emit socket event for real-time updates
//     if (socket) {
//       socket.emit('todo-updated', updatedTodo);
//     }
//   };

//   const handleTodoDeleted = (todoId: string) => {
//     setTodos(prev => prev.filter(todo => todo._id !== todoId));
//   };

//   const filteredTodos = todos.filter(todo => {
//     const matchesSearch = todo.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          todo.createdBy.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          todo.assignedTo?.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    
//     const matchesStatus = filterStatus === 'all' || todo.status === filterStatus;
//     const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;

//     return matchesSearch && matchesStatus && matchesPriority;
//   });

//   const todaysTodos = filteredTodos.filter(todo => {
//     if (!todo.dueDate) return false;
//     const today = new Date().toDateString();
//     return new Date(todo.dueDate).toDateString() === today;
//   });

//   const overdueTodos = filteredTodos.filter(todo => {
//     if (!todo.dueDate || todo.status === 'completed') return false;
//     return new Date(todo.dueDate) < new Date();
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
//       {/* Header */}
//       <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-4">
//               <h1 className="text-xl font-bold text-gray-900">TodoChat</h1>
//               <div className="flex items-center space-x-2">
//                 <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`} />
//                 <span className="text-sm text-gray-600">
//                   {online ? 'Online' : 'Offline'}
//                 </span>
//               </div>
//             </div>

//             <div className="flex items-center space-x-3">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setShowUserSearch(true)}
//                 icon={<Search className="w-4 h-4" />}
//               >
//                 Find Users
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 icon={<Bell className="w-4 h-4" />}
//               >
//                 Notifications
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 icon={<Settings className="w-4 h-4" />}
//               >
//                 Settings
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={logout}
//                 icon={<LogOut className="w-4 h-4" />}
//               >
//                 Logout
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           {/* Sidebar */}
//           <div className="lg:col-span-1">
//             <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
//               <div className="flex items-center space-x-3 mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
//                   {user?.displayName[0]?.toUpperCase()}
//                 </div>
//                 <div>
//                   <h2 className="font-semibold text-gray-900">{user?.displayName}</h2>
//                   <p className="text-sm text-gray-600">@{user?.username}</p>
//                 </div>
//               </div>

//               <Button
//                 onClick={() => setShowCreateTodo(true)}
//                 className="w-full mb-6"
//                 icon={<Plus className="w-4 h-4" />}
//               >
//                 Create Todo
//               </Button>

//               {/* Quick Stats */}
//               <div className="space-y-4">
//                 <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4">
//                   <h3 className="font-medium text-gray-900 mb-2">Today's Todos</h3>
//                   <p className="text-2xl font-bold text-blue-600">{todaysTodos.length}</p>
//                 </div>
                
//                 {overdueTodos.length > 0 && (
//                   <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-4">
//                     <h3 className="font-medium text-gray-900 mb-2">Overdue</h3>
//                     <p className="text-2xl font-bold text-red-600">{overdueTodos.length}</p>
//                   </div>
//                 )}

//                 <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4">
//                   <h3 className="font-medium text-gray-900 mb-2">Completed</h3>
//                   <p className="text-2xl font-bold text-green-600">
//                     {filteredTodos.filter(todo => todo.status === 'completed').length}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="lg:col-span-3">
//             {/* Search and Filters */}
//             <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 mb-6">
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <div className="flex-1">
//                   <Input
//                     type="text"
//                     placeholder="Search todos..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     icon={Search}
//                   />
//                 </div>
//                 <div className="flex gap-2">
//                   <select
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value as any)}
//                     className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:outline-none"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="pending">Pending</option>
//                     <option value="completed">Completed</option>
//                   </select>
//                   <select
//                     value={filterPriority}
//                     onChange={(e) => setFilterPriority(e.target.value as any)}
//                     className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:outline-none"
//                   >
//                     <option value="all">All Priority</option>
//                     <option value="low">Low</option>
//                     <option value="medium">Medium</option>
//                     <option value="high">High</option>
//                     <option value="urgent">Urgent</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Todo List */}
//             <TodoList
//               todos={filteredTodos}
//               loading={loading}
//               onTodoUpdated={handleTodoUpdated}
//               onTodoDeleted={handleTodoDeleted}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {showCreateTodo && (
//         <CreateTodo
//           onClose={() => setShowCreateTodo(false)}
//           onTodoCreated={handleTodoCreated}
//         />
//       )}

//       {showUserSearch && (
//         <UserSearch
//           onClose={() => setShowUserSearch(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Bell, Settings, LogOut, MessageSquare, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import TodoList from '../Todo/TodoList';
import CreateTodo from '../Todo/CreateTodo';
import UserSearch from '../User/UserSearch';
import ChatView from '../Chat/ChatView.tsx';
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

const Dashboard: React.FC = ({base_url}) => {
  const { user, logout } = useAuth();
  const { socket, online } = useSocket();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTodo, setShowCreateTodo] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [activeView, setActiveView] = useState<'todos' | 'chat'>('todos');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-todo', (todo: Todo) => {
        setTodos(prev => [todo, ...prev]);
      });

      socket.on('todo-updated', (updatedTodo: Todo) => {
        setTodos(prev => prev.map(todo =>
          todo._id === updatedTodo._id ? updatedTodo : todo
        ));
      });

      return () => {
        socket.off('new-todo');
        socket.off('todo-updated');
      };
    }
  }, [socket]);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${base_url}/api/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleTodoCreated = (newTodo: Todo) => {
    setTodos(prev => [newTodo, ...prev]);
    setShowCreateTodo(false);

    // Emit socket event for real-time updates
    if (socket) {
      socket.emit('todo-created', newTodo);
    }
  };

  const handleTodoUpdated = (updatedTodo: Todo) => {
    setTodos(prev => prev.map(todo =>
      todo._id === updatedTodo._id ? updatedTodo : todo
    ));

    // Emit socket event for real-time updates
    if (socket) {
      socket.emit('todo-updated', updatedTodo);
    }
  };

  const handleTodoDeleted = (todoId: string) => {
    setTodos(prev => prev.filter(todo => todo._id !== todoId));
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.createdBy.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.assignedTo?.displayName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || todo.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const todaysTodos = filteredTodos.filter(todo => {
    if (!todo.dueDate) return false;
    const today = new Date().toDateString();
    return new Date(todo.dueDate).toDateString() === today;
  });

  const overdueTodos = filteredTodos.filter(todo => {
    if (!todo.dueDate || todo.status === 'completed') return false;
    return new Date(todo.dueDate) < new Date();
  });

  // Get unique users who have shared todos with current user
  const chatUsers = todos.reduce((users, todo) => {
    if (todo.createdBy._id !== user?.id && !users.find(u => u._id === todo.createdBy._id)) {
      users.push(todo.createdBy);
    }
    if (todo.assignedTo && todo.assignedTo._id !== user?.id && !users.find(u => u._id === todo.assignedTo._id)) {
      users.push(todo.assignedTo);
    }
    return users;
  }, [] as Array<{ _id: string, username: string, displayName: string, avatar: string }>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">TodoChat</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={activeView === 'todos' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('todos')}
                  icon={<Filter className="w-4 h-4" />}
                >
                  All Todos
                </Button>
                <Button
                  variant={activeView === 'chat' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('chat')}
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Chat View
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserSearch(true)}
                icon={<Search className="w-4 h-4" />}
              >
                Find Users
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Bell className="w-4 h-4" />}
              >
                Notifications
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                icon={<LogOut className="w-4 h-4" />}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {user?.displayName[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{user?.displayName}</h2>
                  <p className="text-sm text-gray-600">@{user?.username}</p>
                </div>
              </div>

              <Button
                onClick={() => setShowCreateTodo(true)}
                className="w-full mb-6"
                icon={<Plus className="w-4 h-4" />}
              >
                Create Todo
              </Button>

              {/* Quick Stats */}
              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Today's Todos</h3>
                  <p className="text-2xl font-bold text-blue-600">{todaysTodos.length}</p>
                </div>

                {overdueTodos.length > 0 && (
                  <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Overdue</h3>
                    <p className="text-2xl font-bold text-red-600">{overdueTodos.length}</p>
                  </div>
                )}

                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Completed</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredTodos.filter(todo => todo.status === 'completed').length}
                  </p>
                </div>
              </div>

              {/* Chat Users */}
              {activeView === 'chat' && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Chat with Users
                  </h3>
                  <div className="space-y-2">
                    {chatUsers.map((chatUser) => (
                      <button
                        key={chatUser._id}
                        onClick={() => setSelectedUser(chatUser._id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${selectedUser === chatUser._id
                            ? 'bg-purple-100 border-2 border-purple-300'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {chatUser.displayName[0]?.toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm">{chatUser.displayName}</p>
                          <p className="text-xs text-gray-500">@{chatUser.username}</p>
                        </div>
                      </button>
                    ))}
                    {chatUsers.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No shared todos yet
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeView === 'todos' ? (
              <>
                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Search todos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={Search}
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:outline-none"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as any)}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:outline-none"
                      >
                        <option value="all">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Todo List */}
                <TodoList
                  todos={filteredTodos}
                  loading={loading}
                  onTodoUpdated={handleTodoUpdated}
                  onTodoDeleted={handleTodoDeleted}
                />
              </>
            ) : (
              <ChatView
                todos={todos}
                selectedUserId={selectedUser}
                onTodoUpdated={handleTodoUpdated}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateTodo && (
        <CreateTodo
          onClose={() => setShowCreateTodo(false)}
          onTodoCreated={handleTodoCreated}
        />
      )}

      {showUserSearch && (
        <UserSearch
          onClose={() => setShowUserSearch(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;