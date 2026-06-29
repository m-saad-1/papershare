import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';

import {
  FaPaperPlane,
  FaSpinner,
  FaSearch,
  FaPaperclip,
  FaTimes,
  FaImage,
  FaFile,
  FaMusic,
  FaFilePdf
} from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '@/apiClient';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { LazyImage } from '@/components/ui/LazyImage';
import UserAvatar from '@/components/ui/UserAvatar.jsx';

// Fetch conversations list for sidebar
const fetchConversations = async () => {
  const { data } = await apiClient.get('/messages/conversations');
  return data;
};

const fetchConversation = async (recipientId) => {
  if (!recipientId) return null;
  const { data } = await apiClient.post('/messages/conversations', { recipientId });
  return data;
};

const fetchMessages = async (conversationId) => {
  if (!conversationId) return [];
  const { data } = await apiClient.get(`/messages/${conversationId}/messages`);
  return data;
};

const Chat = () => {
  const { recipientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Initial state for sidebarOpen based on screen size and recipientId
    if (typeof window !== 'undefined') {
      const isLargeScreen = window.innerWidth >= 1024;
      if (isLargeScreen) {
        return true; // Always open on desktop
      } else {
        return !recipientId; // Open on mobile only if no recipientId is present
      }
    }
    return true; // Default to open if window is not defined (e.g., during SSR)
  });
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { user } = useAuth();
  const currentUserId = user?._id;
  const chatViewportStyle = { height: 'calc(100vh - var(--navbar-height, 64px))' };

  // Fetch conversations for sidebar
  const { 
    data: conversations = [], 
    isLoading: isConversationsLoading 
  } = useQuery(
    'conversations',
    fetchConversations,
    {
      refetchInterval: 10000,
    }
  );

  // Fetch active conversation
  const {
    data: conversation,
    isLoading: isConversationLoading,
    isError: isConversationError,
  } = useQuery(
    ['conversation', recipientId],
    () => fetchConversation(recipientId),
    {
      enabled: !!recipientId,
      staleTime: Infinity,
    }
  );

  const conversationId = conversation?._id;
  const recipient = conversation?.participants?.find(p => p._id === recipientId);

  // Fetch messages
  const {
    data: messages = [],
    isLoading: areMessagesLoading,
  } = useQuery(
    ['messages', conversationId],
    () => fetchMessages(conversationId),
    {
      enabled: !!conversationId,
      refetchInterval: 3000,
    }
  );

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !conversationId) return;
  
    const formData = new FormData();
    if (newMessage.trim()) {
      formData.append('text', newMessage);
    }
    if (selectedFile) {
      formData.append('file', selectedFile, selectedFile.name);
    }
  
    // Store original values to restore them if sending fails
    const originalText = newMessage;
    const originalFile = selectedFile;
  
    setNewMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    try {
      // Let Axios automatically set the 'Content-Type' header to 'multipart/form-data' with the correct boundary.
      await apiClient.post(`/messages/${conversationId}/messages`, formData);
      queryClient.invalidateQueries(['messages', conversationId]);
      queryClient.invalidateQueries('conversations');
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error.response?.data || error.message);
      toast.error('Failed to send message. Please try again.');
      setNewMessage(originalText); // Restore input fields on error
      setSelectedFile(originalFile);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // You can add more validation here (e.g., file size)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Unsupported file type. Please select an image or PDF.');
        return;
      }
      setSelectedFile(file);
    }

  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    // Removed setIsTypingLocal logic as it pertains to the current user's typing
  };

  // Helper to get file icon
  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFile className="text-gray-500" />;
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <FaImage className="text-blue-500" />;
    }
    if (extension === 'pdf') return <FaFilePdf className="text-red-500" />;
    if (['mp3', 'wav'].includes(extension)) return <FaMusic className="text-purple-500" />;
    return <FaFile className="text-gray-500" />;
  }

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants?.find(p => p._id !== currentUserId);
    if (!otherParticipant) return false;
    return otherParticipant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.lastMessage?.text?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages?.length > 0 && conversationId) {
      // For initial load, scroll instantly without animation.
      // The check for scrollTop ensures this only runs once on load.
      if (chatContainerRef.current && chatContainerRef.current.scrollTop === 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      } else {
        // For new messages, scroll smoothly.
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [messages, conversationId]);

  // Focus input on load

  // Handle responsive sidebar and initial sidebar state
  useEffect(() => {
    const handleResize = () => {
      const isCurrentlyMobile = window.innerWidth < 1024;
      setIsMobile(isCurrentlyMobile);

      if (isCurrentlyMobile) {
        // On mobile, if a recipient is selected, close sidebar; otherwise, open it.
        setSidebarOpen(!recipientId);
      } else {
        // On desktop, always open sidebar
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [recipientId]); // Re-run when recipientId changes



  // Helper to get avatar URL
  const getAvatarUrl = (profilePicture) => {
    if (!profilePicture) return null;
    return `${apiClient.defaults.baseURL.replace('/api', '')}/${profilePicture.replace(/\\/g, '/')}`;
  };

  if (isConversationLoading && recipientId) {
    return (
      <div className="flex items-center justify-center bg-gray-50 overflow-hidden p-3 sm:p-4" style={chatViewportStyle}>
        <div className="text-center card p-6 sm:p-8">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <p className="text-fluid-base text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (isConversationError || (recipientId && !recipient)) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 overflow-hidden p-3 sm:p-4" style={chatViewportStyle}>
        <div className="text-center p-6 sm:p-8 card max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-fluid-base font-semibold text-gray-800 mb-2">Conversation not found</h3>
          <p className="text-fluid-sm text-gray-600 mb-6">The user you're trying to chat with doesn't exist or you don't have permission to access this conversation.</p>
          <button
            onClick={() => navigate('/messages')}
            className="px-6 py-2 min-h-touch bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 overflow-hidden" style={chatViewportStyle}>
      {/* Sidebar for Conversations */}
      <div className={`
        fixed lg:static inset-0 z-30 w-full lg:w-80
        bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        flex flex-col h-full shadow-lg lg:shadow-sm
      `}>
        {/* Sidebar Header */}
        <div className="p-3 sm:p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-fluid-base font-bold text-gray-900">Messages</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 min-h-touch min-w-[44px] flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 min-h-touch bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:shadow-sm transition-all text-fluid-sm"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {isConversationsLoading ? (
            <div className="flex items-center justify-center h-32">
              <FaSpinner className="animate-spin text-primary-600" />
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {filteredConversations.map((conv) => {
                const otherParticipant = conv.participants?.find(p => p._id !== currentUserId);
                if (!otherParticipant) return null;

                return (
                  <Link
                    key={conv._id}
                    to={`/messages/${otherParticipant._id}`}
                    className={`flex items-center p-3 sm:p-4 min-h-touch hover:bg-gray-50 transition-all duration-200 ${
                      recipientId === otherParticipant._id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                    }`}
                    onClick={() => {
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <UserAvatar
                        user={otherParticipant}
                        className="w-10 h-10 shadow-sm rounded-full object-cover"
                      />
                      {otherParticipant.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 text-fluid-sm truncate">
                            {otherParticipant.username}
                          </h3>
                          <p className="text-[11px] text-gray-500 truncate">
                            {otherParticipant.isOnline ? 'Online' : 'Last seen recently'}
                          </p>
                        </div>
                        {conv.lastMessage && (
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-fluid-sm text-gray-500 truncate leading-tight">
                          <span className={conv.lastMessage.sender === otherParticipant._id ? '' : 'font-medium text-primary-600'}>
                            {conv.lastMessage.sender === otherParticipant._id ? '' : 'You: '}
                          </span>
                          {conv.lastMessage.text}
                        </p>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium bg-primary-500 text-white rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 p-3 sm:p-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-gray-400" />
              </div>
              <p className="text-fluid-sm text-gray-500">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center p-3 sm:p-4 bg-white border-b border-gray-100 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 mr-2 min-h-touch min-w-[44px] flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <FiMenu className="text-xl text-gray-600" />
          </button>
          {recipient ? (
            <>
              <UserAvatar
                user={recipient}
                className="w-8 h-8 mr-3 shadow-sm rounded-full object-cover"
              />
              <div className="flex-1">
                <Link to={`/profile/${recipient._id}`} className="font-semibold text-fluid-sm text-gray-900 hover:text-primary-600 transition-colors">
                  {recipient.username}
                </Link>
                <p className="text-xs text-gray-500">
                  {recipient.isOnline ? 'Online' : 'Last seen recently'}
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1">
              <h2 className="font-semibold text-fluid-sm text-gray-900">Select a conversation</h2>
            </div>
          )}
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!recipientId ? (
            // Empty state when no conversation is selected
            <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 text-center">
              <div className="card p-6 sm:p-8 max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm">
                  <FaPaperPlane className="text-3xl text-primary-400" />
                </div>
                <h3 className="text-fluid-base font-semibold text-gray-900 mb-2">Welcome to Messages</h3>
                <p className="text-fluid-sm text-gray-600 max-w-sm mb-6">
                  Select a conversation from the sidebar or start a new one to begin chatting
                </p>
                <button
                  onClick={() => navigate('/messages/new')}
                  className="px-6 py-3 min-h-touch bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
                >
                  Start New Conversation
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Chat Header - Desktop */}
              <div className="hidden lg:flex items-center justify-between p-3 sm:p-4 bg-white border-b border-gray-100 shadow-sm">
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <UserAvatar
                      user={recipient}
                      className="w-10 h-10 shadow-sm rounded-full object-cover"
                    />
                    {recipient?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    )}
                  </div>
                  <div>
                    <Link
                      to={`/profile/${recipient?._id}`}
                      className="font-semibold text-fluid-sm text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {recipient?.username}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {recipient?.isOnline ? 'Online' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto hide-scrollbar bg-gradient-to-b from-gray-50/50 to-gray-50/30 min-h-0"
              >
                <div className="p-3 sm:p-4 h-full">
                  {areMessagesLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <FaSpinner className="animate-spin text-primary-600 mr-2" />
                      <span className="text-fluid-sm text-gray-600">Loading messages...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center h-full">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <FaPaperPlane className="text-2xl text-primary-400" />
                      </div>
                      <h3 className="text-fluid-base font-semibold text-gray-900 mb-2">No messages yet</h3>
                      <p className="text-fluid-sm text-gray-600 max-w-xs">
                        Start the conversation by sending your first message to {recipient.username}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pb-5">
                      {messages.map((msg, index) => {
                        const isSender = msg.sender?._id === currentUserId || msg.sender === currentUserId;
                        const showDate = index === 0 ||
                          new Date(msg.createdAt).toDateString() !==
                          new Date(messages[index - 1].createdAt).toDateString();

                        return (
                          <React.Fragment key={msg._id}>
                            {showDate && (
                              <div className="flex justify-center my-3">
                                <span className="px-3 py-1.5 bg-gray-200/80 text-gray-700 text-xs font-medium rounded-full backdrop-blur-sm">
                                  {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] lg:max-w-[70%] ${isSender ? 'order-2' : 'order-1'}`}>
                                <div className={`flex items-end gap-2 ${isSender ? 'flex-row-reverse' : ''}`}>
                                  {/* Avatar for received messages */}
                                  {!isSender && (
                                    <div className="w-7 h-7 flex-shrink-0">
                                      <UserAvatar
                                        user={msg.sender}
                                        className="w-full h-full shadow-sm rounded-full object-cover"
                                      />
                                    </div>
                                  )}

                                  {/* Message Bubble */}
                                  <div
                                    className={`
                                      card px-4 py-3 rounded-2xl
                                      ${isSender
                                        ? 'bg-primary-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'
                                      }
                                    `}
                                  >
                                    {msg.fileUrl ? (
                                      <a
                                        href={`${apiClient.defaults.baseURL.replace('/api', '')}/${msg.fileUrl.replace(/\\/g, '/')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-black/10"
                                      >
                                        <div className="text-2xl">
                                          {getFileIcon(msg.fileName)}
                                        </div>
                                        <div className="min-w-0">
                                          <p className={`text-fluid-sm font-medium truncate ${isSender ? 'text-white' : 'text-gray-800'}`}>
                                            {msg.fileName || 'Attachment'}
                                          </p>
                                          {msg.text && <p className="text-fluid-sm mt-1">{msg.text}</p>}
                                        </div>
                                      </a>
                                    ) : (
                                      <p className="text-fluid-sm">{msg.text}</p>
                                    )}

                                    <div className={`text-xs mt-2 ${isSender ? 'text-primary-200' : 'text-gray-400'}`}>
                                      {format(new Date(msg.createdAt), 'HH:mm')}
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}


                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div className="mt-auto p-2 sm:p-3 bg-white border-t border-gray-100 shadow-lg sticky bottom-0 z-10 safe-bottom">
                <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
                  {/* Attachment Button for PDF */}
                  <button
                    type="button"
                    className="p-2 min-h-touch min-w-[44px] flex items-center justify-center hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-700 transition-colors"
                    title="Attach PDF"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaPaperclip className="text-sm" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="application/pdf,image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                  />

                  {/* Message Input */}
                  <div className="flex-1">
                    {selectedFile ? (
                      <div className="flex items-center justify-between px-3 py-2 min-h-touch bg-gray-100 rounded-xl">
                        <div className="flex items-center gap-2 text-fluid-sm text-gray-700">
                          {getFileIcon(selectedFile.name)}
                          <span className="truncate max-w-xs">{selectedFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="p-1 min-h-touch min-w-[44px] flex items-center justify-center hover:bg-gray-200 rounded-full"
                        ><FaTimes className="text-xs text-gray-500" /></button>
                      </div>
                    ) : (
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={handleInputChange}
                      placeholder="Type your message..."
                      className="w-full px-3 py-2 min-h-touch bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:shadow-sm transition-all text-fluid-sm"
                      autoComplete="off"
                    />
                    )}
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && !selectedFile}
                    className="p-2 min-h-touch min-w-[44px] flex items-center justify-center bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    title="Send message"
                  >
                    <FaPaperPlane className="text-sm" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};


export default Chat;