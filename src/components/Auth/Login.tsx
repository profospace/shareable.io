// // import React, { useState } from 'react';
// // import { motion } from 'framer-motion';
// // import { Phone, MessageCircle, User, Hash } from 'lucide-react';
// // import axios from 'axios';
// // import toast from 'react-hot-toast';
// // import { useAuth } from '../../contexts/AuthContext';
// // import Button from '../UI/Button';
// // import Input from '../UI/Input';

// // const Login: React.FC = () => {
// //   const [step, setStep] = useState<'phone' | 'verify' | 'profile'>('phone');
// //   const [phoneNumber, setPhoneNumber] = useState('');
// //   const [verificationCode, setVerificationCode] = useState('');
// //   const [username, setUsername] = useState('');
// //   const [displayName, setDisplayName] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [demoCode, setDemoCode] = useState(''); // For demo purposes
// //   const { login } = useAuth();

// //   const handleSendCode = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!phoneNumber.trim()) {
// //       toast.error('Please enter your phone number');
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const response = await axios.post('${base_url}/api/auth/send-code', {
// //         phoneNumber: phoneNumber.trim()
// //       });
      
// //       setDemoCode(response.data.code); // Store demo code
// //       toast.success('Verification code sent! Check the console for demo code.');
// //       setStep('verify');
// //     } catch (error: any) {
// //       toast.error(error.response?.data?.message || 'Failed to send verification code');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleVerifyCode = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!verificationCode.trim()) {
// //       toast.error('Please enter the verification code');
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const response = await axios.post('http://localhost:5000/api/auth/verify-code', {
// //         phoneNumber,
// //         code: verificationCode.trim()
// //       });

// //       if (response.data.user.displayName === 'New User') {
// //         setStep('profile');
// //       } else {
// //         login(response.data.token, response.data.user);
// //       }
// //     } catch (error: any) {
// //       toast.error(error.response?.data?.message || 'Invalid verification code');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleCompleteProfile = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!username.trim() || !displayName.trim()) {
// //       toast.error('Please fill in all fields');
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const response = await axios.post('http://localhost:5000/api/auth/verify-code', {
// //         phoneNumber,
// //         code: verificationCode,
// //         username: username.trim(),
// //         displayName: displayName.trim()
// //       });

// //       login(response.data.token, response.data.user);
// //     } catch (error: any) {
// //       toast.error(error.response?.data?.message || 'Failed to complete profile');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const checkUsername = async (value: string) => {
// //     if (value.length < 3) return;
// //     try {
// //       const response = await axios.post('http://localhost:5000/api/auth/check-username', {
// //         username: value
// //       });
// //       if (!response.data.available) {
// //         toast.error('Username already taken');
// //       }
// //     } catch (error) {
// //       console.error('Username check failed:', error);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen flex items-center justify-center p-4">
// //       <motion.div
// //         initial={{ opacity: 0, y: 20 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         className="w-full max-w-md"
// //       >
// //         <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
// //           <div className="text-center mb-8">
// //             <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
// //               <MessageCircle className="text-white text-2xl" />
// //             </div>
// //             <h1 className="text-2xl font-bold text-gray-900 mb-2">TodoChat</h1>
// //             <p className="text-gray-600">Share todos like chat messages</p>
// //           </div>

// //           {step === 'phone' && (
// //             <motion.form
// //               initial={{ opacity: 0, x: -20 }}
// //               animate={{ opacity: 1, x: 0 }}
// //               onSubmit={handleSendCode}
// //               className="space-y-6"
// //             >
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Phone Number
// //                 </label>
// //                 <Input
// //                   type="tel"
// //                   value={phoneNumber}
// //                   onChange={(e) => setPhoneNumber(e.target.value)}
// //                   placeholder="+1234567890"
// //                   icon={Phone}
// //                   required
// //                 />
// //                 <p className="text-xs text-gray-500 mt-1">
// //                   Include country code (e.g., +1 for US)
// //                 </p>
// //               </div>
// //               <Button type="submit" loading={loading} className="w-full">
// //                 Send Verification Code
// //               </Button>
// //             </motion.form>
// //           )}

// //           {step === 'verify' && (
// //             <motion.form
// //               initial={{ opacity: 0, x: -20 }}
// //               animate={{ opacity: 1, x: 0 }}
// //               onSubmit={handleVerifyCode}
// //               className="space-y-6"
// //             >
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Verification Code
// //                 </label>
// //                 <Input
// //                   type="text"
// //                   value={verificationCode}
// //                   onChange={(e) => setVerificationCode(e.target.value)}
// //                   placeholder="Enter 6-digit code"
// //                   maxLength={6}
// //                   required
// //                 />
// //                 {demoCode && (
// //                   <p className="text-xs text-blue-600 mt-1">
// //                     Demo code: {demoCode}
// //                   </p>
// //                 )}
// //               </div>
// //               <div className="flex space-x-3">
// //                 <Button
// //                   type="button"
// //                   variant="outline"
// //                   onClick={() => setStep('phone')}
// //                   className="flex-1"
// //                 >
// //                   Back
// //                 </Button>
// //                 <Button type="submit" loading={loading} className="flex-1">
// //                   Verify Code
// //                 </Button>
// //               </div>
// //             </motion.form>
// //           )}

// //           {step === 'profile' && (
// //             <motion.form
// //               initial={{ opacity: 0, x: -20 }}
// //               animate={{ opacity: 1, x: 0 }}
// //               onSubmit={handleCompleteProfile}
// //               className="space-y-6"
// //             >
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Username
// //                 </label>
// //                 <Input
// //                   type="text"
// //                   value={username}
// //                   onChange={(e) => {
// //                     setUsername(e.target.value);
// //                     checkUsername(e.target.value);
// //                   }}
// //                   placeholder="your_username"
// //                   icon={Hash}
// //                   required
// //                 />
// //                 <p className="text-xs text-gray-500 mt-1">
// //                   3-20 characters, letters, numbers, and underscores only
// //                 </p>
// //               </div>
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Display Name
// //                 </label>
// //                 <Input
// //                   type="text"
// //                   value={displayName}
// //                   onChange={(e) => setDisplayName(e.target.value)}
// //                   placeholder="Your Name"
// //                   icon={User}
// //                   required
// //                 />
// //               </div>
// //               <div className="flex space-x-3">
// //                 <Button
// //                   type="button"
// //                   variant="outline"
// //                   onClick={() => setStep('verify')}
// //                   className="flex-1"
// //                 >
// //                   Back
// //                 </Button>
// //                 <Button type="submit" loading={loading} className="flex-1">
// //                   Complete Profile
// //                 </Button>
// //               </div>
// //             </motion.form>
// //           )}
// //         </div>
// //       </motion.div>
// //     </div>
// //   );
// // };

// // export default Login;


// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Phone, MessageCircle, User, Hash, Check, X } from 'lucide-react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { useAuth } from '../../contexts/AuthContext';
// import Button from '../UI/Button';
// import Input from '../UI/Input';




// const Login: React.FC = ({base_url}) => {
//   const [step, setStep] = useState<'phone' | 'verify' | 'profile'>('phone');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [username, setUsername] = useState('');
//   const [displayName, setDisplayName] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [demoCode, setDemoCode] = useState(''); // For demo purposes
//   const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
//   const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);
//   const { login } = useAuth();

//   const handleSendCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!phoneNumber.trim()) {
//       toast.error('Please enter your phone number');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post(`${base_url}/api/auth/send-code`, {
//         phoneNumber: phoneNumber.trim()
//       });

//       setDemoCode(response.data.code); // Store demo code
//       toast.success('Verification code sent! Check the console for demo code.');
//       setStep('verify');
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to send verification code');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!verificationCode.trim()) {
//       toast.error('Please enter the verification code');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post(`${base_url}/api/auth/verify-code`, {
//         phoneNumber,
//         code: verificationCode.trim()
//       });

//       if (response.data.user.displayName === 'New User') {
//         setStep('profile');
//       } else {
//         login(response.data.token, response.data.user);
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Invalid verification code');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkUsername = async (value: string) => {
//     if (value.length < 3) {
//       setUsernameStatus('idle');
//       return;
//     }

//     // Clear previous timeout
//     if (usernameCheckTimeout) {
//       clearTimeout(usernameCheckTimeout);
//     }

//     setUsernameStatus('checking');

//     // Debounce the API call
//     const timeout = setTimeout(async () => {
//       try {
//         const response = await axios.post(`${base_url}/api/auth/check-username`, {
//           username: value
//         });
//         setUsernameStatus(response.data.available ? 'available' : 'taken');
//       } catch (error) {
//         console.error('Username check failed:', error);
//         setUsernameStatus('idle');
//       }
//     }, 500);

//     setUsernameCheckTimeout(timeout);
//   };

//   const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
//     setUsername(value);
//     checkUsername(value);
//   };

//   const handleCompleteProfile = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!username.trim() || !displayName.trim()) {
//       toast.error('Please fill in all fields');
//       return;
//     }

//     if (usernameStatus !== 'available') {
//       toast.error('Please choose an available username');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post(`${base_url}/api/auth/verify-code`, {
//         phoneNumber,
//         code: verificationCode,
//         username: username.trim(),
//         displayName: displayName.trim()
//       });

//       login(response.data.token, response.data.user);
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to complete profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getUsernameIcon = () => {
//     switch (usernameStatus) {
//       case 'checking':
//         return <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />;
//       case 'available':
//         return <Check className="w-4 h-4 text-green-500" />;
//       case 'taken':
//         return <X className="w-4 h-4 text-red-500" />;
//       default:
//         return <Hash className="w-4 h-4 text-gray-400" />;
//     }
//   };

//   const getUsernameMessage = () => {
//     switch (usernameStatus) {
//       case 'checking':
//         return 'Checking availability...';
//       case 'available':
//         return 'Username is available!';
//       case 'taken':
//         return 'Username is already taken';
//       default:
//         return '3-20 characters, letters, numbers, and underscores only';
//     }
//   };

//   const getUsernameMessageColor = () => {
//     switch (usernameStatus) {
//       case 'available':
//         return 'text-green-600';
//       case 'taken':
//         return 'text-red-600';
//       default:
//         return 'text-gray-500';
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md"
//       >
//         <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
//           <div className="text-center mb-8">
//             <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
//               <MessageCircle className="text-white text-2xl" />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">TodoChat</h1>
//             <p className="text-gray-600">Share todos like chat messages</p>
//           </div>

//           {step === 'phone' && (
//             <motion.form
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               onSubmit={handleSendCode}
//               className="space-y-6"
//             >
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone Number
//                 </label>
//                 <Input
//                   type="tel"
//                   value={phoneNumber}
//                   onChange={(e) => setPhoneNumber(e.target.value)}
//                   placeholder="+1234567890"
//                   icon={Phone}
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Include country code (e.g., +1 for US)
//                 </p>
//               </div>
//               <Button type="submit" loading={loading} className="w-full">
//                 Send Verification Code
//               </Button>
//             </motion.form>
//           )}

//           {step === 'verify' && (
//             <motion.form
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               onSubmit={handleVerifyCode}
//               className="space-y-6"
//             >
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Verification Code
//                 </label>
//                 <Input
//                   type="text"
//                   value={verificationCode}
//                   onChange={(e) => setVerificationCode(e.target.value)}
//                   placeholder="Enter 6-digit code"
//                   maxLength={6}
//                   required
//                 />
//                 {demoCode && (
//                   <p className="text-xs text-blue-600 mt-1">
//                     Demo code: {demoCode}
//                   </p>
//                 )}
//               </div>
//               <div className="flex space-x-3">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setStep('phone')}
//                   className="flex-1"
//                 >
//                   Back
//                 </Button>
//                 <Button type="submit" loading={loading} className="flex-1">
//                   Verify Code
//                 </Button>
//               </div>
//             </motion.form>
//           )}

//           {step === 'profile' && (
//             <motion.form
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               onSubmit={handleCompleteProfile}
//               className="space-y-6"
//             >
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Username
//                 </label>
//                 <div className="relative">
//                   <Input
//                     type="text"
//                     value={username}
//                     onChange={handleUsernameChange}
//                     placeholder="your_username"
//                     className={`pr-10 ${usernameStatus === 'available' ? 'border-green-300 focus:border-green-500' :
//                         usernameStatus === 'taken' ? 'border-red-300 focus:border-red-500' : ''
//                       }`}
//                     required
//                     minLength={3}
//                     maxLength={20}
//                   />
//                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//                     {getUsernameIcon()}
//                   </div>
//                 </div>
//                 <p className={`text-xs mt-1 ${getUsernameMessageColor()}`}>
//                   {getUsernameMessage()}
//                 </p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Display Name
//                 </label>
//                 <Input
//                   type="text"
//                   value={displayName}
//                   onChange={(e) => setDisplayName(e.target.value)}
//                   placeholder="Your Name"
//                   icon={User}
//                   required
//                   maxLength={50}
//                 />
//               </div>
//               <div className="flex space-x-3">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setStep('verify')}
//                   className="flex-1"
//                 >
//                   Back
//                 </Button>
//                 <Button
//                   type="submit"
//                   loading={loading}
//                   className="flex-1"
//                   disabled={usernameStatus !== 'available'}
//                 >
//                   Complete Profile
//                 </Button>
//               </div>
//             </motion.form>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;

// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Phone, MessageCircle, User, Hash } from 'lucide-react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { useAuth } from '../../contexts/AuthContext';
// import Button from '../UI/Button';
// import Input from '../UI/Input';

// const Login: React.FC = () => {
//   const [step, setStep] = useState<'phone' | 'verify' | 'profile'>('phone');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [username, setUsername] = useState('');
//   const [displayName, setDisplayName] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [demoCode, setDemoCode] = useState(''); // For demo purposes
//   const { login } = useAuth();

//   const handleSendCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!phoneNumber.trim()) {
//       toast.error('Please enter your phone number');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post('${base_url}/api/auth/send-code', {
//         phoneNumber: phoneNumber.trim()
//       });

//       setDemoCode(response.data.code); // Store demo code
//       toast.success('Verification code sent! Check the console for demo code.');
//       setStep('verify');
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to send verification code');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!verificationCode.trim()) {
//       toast.error('Please enter the verification code');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/verify-code', {
//         phoneNumber,
//         code: verificationCode.trim()
//       });

//       if (response.data.user.displayName === 'New User') {
//         setStep('profile');
//       } else {
//         login(response.data.token, response.data.user);
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Invalid verification code');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCompleteProfile = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!username.trim() || !displayName.trim()) {
//       toast.error('Please fill in all fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/verify-code', {
//         phoneNumber,
//         code: verificationCode,
//         username: username.trim(),
//         displayName: displayName.trim()
//       });

//       login(response.data.token, response.data.user);
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to complete profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkUsername = async (value: string) => {
//     if (value.length < 3) return;
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/check-username', {
//         username: value
//       });
//       if (!response.data.available) {
//         toast.error('Username already taken');
//       }
//     } catch (error) {
//       console.error('Username check failed:', error);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md"
//       >
//         <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
//           <div className="text-center mb-8">
//             <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
//               <MessageCircle className="text-white text-2xl" />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">TodoChat</h1>
//             <p className="text-gray-600">Share todos like chat messages</p>
//           </div>

//           {step === 'phone' && (
//             <motion.form
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               onSubmit={handleSendCode}
//               className="space-y-6"
//             >
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone Number
//                 </label>
//                 <Input
//                   type="tel"
//                   value={phoneNumber}
//                   onChange={(e) => setPhoneNumber(e.target.value)}
//                   placeholder="+1234567890"
//                   icon={Phone}
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Include country code (e.g., +1 for US)
//                 </p>
//               </div>
//               <Button type="submit" loading={loading} className="w-full">
//                 Send Verification Code
//               </Button>
//             </motion.form>
//           )}

//           {step === 'verify' && (
//             <motion.form
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               onSubmit={handleVerifyCode}
//               className="space-y-6"
//             >
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Verification Code
//                 </label>
//                 <Input
//                   type="text"
//                   value={verificationCode}
//                   onChange={(e) => setVerificationCode(e.target.value)}
//                   placeholder="Enter 6-digit code"
//                   maxLength={6}
//                   required
//                 />
//                 {demoCode && (
//                   <p className="text-xs text-blue-600 mt-1">
//                     Demo code: {demoCode}
//                   </p>
//                 )}
//               </div>
//               <div className="flex space-x-3">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setStep('phone')}
//                   className="flex-1"
//                 >
//                   Back
//                 </Button>
//                 <Button type="submit" loading={loading} className="flex-1">
//                   Verify Code
//                 </Button>
//               </div>
//             </motion.form>
//           )}

//           {step === 'profile' && (
//             <motion.form
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               onSubmit={handleCompleteProfile}
//               className="space-y-6"
//             >
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Username
//                 </label>
//                 <Input
//                   type="text"
//                   value={username}
//                   onChange={(e) => {
//                     setUsername(e.target.value);
//                     checkUsername(e.target.value);
//                   }}
//                   placeholder="your_username"
//                   icon={Hash}
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   3-20 characters, letters, numbers, and underscores only
//                 </p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Display Name
//                 </label>
//                 <Input
//                   type="text"
//                   value={displayName}
//                   onChange={(e) => setDisplayName(e.target.value)}
//                   placeholder="Your Name"
//                   icon={User}
//                   required
//                 />
//               </div>
//               <div className="flex space-x-3">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setStep('verify')}
//                   className="flex-1"
//                 >
//                   Back
//                 </Button>
//                 <Button type="submit" loading={loading} className="flex-1">
//                   Complete Profile
//                 </Button>
//               </div>
//             </motion.form>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, User, Hash, Check, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';




const Login: React.FC = ({ base_url }) => {
  const [step, setStep] = useState<'phone' | 'verify' | 'profile'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState(''); // For demo purposes
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const { login } = useAuth();
  
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${base_url}/api/auth/send-code`, {
        phoneNumber: phoneNumber.trim()
      });

      setDemoCode(response.data.code); // Store demo code
      toast.success('Verification code sent! Check the console for demo code.');
      setStep('verify');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${base_url}/api/auth/verify-code`, {
        phoneNumber,
        username,
        displayName,
        code: verificationCode.trim()
      });

      if (response.data.user.displayName === 'New User') {
        setStep('profile');
      } else {
        login(response.data.token, response.data.user);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const checkUsername = async (value: string) => {
    if (value.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    // Clear previous timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }

    setUsernameStatus('checking');

    // Debounce the API call
    const timeout = setTimeout(async () => {
      try {
        const response = await axios.post(`${base_url}/api/auth/check-username`, {
          username: value
        });
        setUsernameStatus(response.data.available ? 'available' : 'taken');
      } catch (error) {
        console.error('Username check failed:', error);
        setUsernameStatus('idle');
      }
    }, 500);

    setUsernameCheckTimeout(timeout);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(value);
    checkUsername(value);
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (usernameStatus !== 'available') {
      toast.error('Please choose an available username');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${base_url}/api/auth/verify-code`, {
        phoneNumber,
        code: verificationCode,
        username: username.trim(),
        displayName: displayName.trim()
      });

      login(response.data.token, response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const getUsernameIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />;
      case 'available':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'taken':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Hash className="w-4 h-4 text-gray-400" />;
    }
  };

  const getUsernameMessage = () => {
    switch (usernameStatus) {
      case 'checking':
        return 'Checking availability...';
      case 'available':
        return 'Username is available!';
      case 'taken':
        return 'Username is already taken';
      default:
        return '3-20 characters, letters, numbers, and underscores only';
    }
  };

  const getUsernameMessageColor = () => {
    switch (usernameStatus) {
      case 'available':
        return 'text-green-600';
      case 'taken':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">TodoChat</h1>
            <p className="text-gray-600">Share todos like chat messages</p>
          </div>

          {step === 'phone' && (
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSendCode}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  icon={Phone}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include country code (e.g., +1 for US)
                </p>
              </div>
              <Button type="submit" loading={loading} className="w-full">
                Send Verification Code
              </Button>
            </motion.form>
          )}

          {step === 'verify' && (
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleVerifyCode}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
                {demoCode && (
                  <p className="text-xs text-blue-600 mt-1">
                    Demo code: {demoCode}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
                
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  required
                />
                
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('phone')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                  Verify Code
                </Button>
              </div>
            </motion.form>
          )}

          {step === 'profile' && (
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleCompleteProfile}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="your_username"
                    className={`pr-10 ${usernameStatus === 'available' ? 'border-green-300 focus:border-green-500' :
                      usernameStatus === 'taken' ? 'border-red-300 focus:border-red-500' : ''
                      }`}
                    required
                    minLength={3}
                    maxLength={20}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {getUsernameIcon()}
                  </div>
                </div>
                <p className={`text-xs mt-1 ${getUsernameMessageColor()}`}>
                  {getUsernameMessage()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  icon={User}
                  required
                  maxLength={50}
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('verify')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1"
                  disabled={usernameStatus !== 'available'}
                >
                  Complete Profile
                </Button>
              </div>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;