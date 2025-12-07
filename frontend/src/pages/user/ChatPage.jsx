import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { Send, ArrowLeft, User, Paperclip, X, FileText } from 'lucide-react';

function clsx(...args) {
  return args.filter(Boolean).join(' ');
}

const ChatPage = () => {
  const { recipientId } = useParams();
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const initialScroll = useRef(true);

  // Fetch conversations
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery(
    'conversations',
    async () => {
      const url = `${import.meta.env.VITE_API_BASE_URL}/messages`;
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        if (recipientId) {
          const existingConvo = data.find(c =>
            c.participants.some(p => p._id === recipientId)
          );
          if (existingConvo) {
            setActiveConversation(existingConvo);
          } else {
            // Temporary UI conversation
            const userDetailsUrl = `${import.meta.env.VITE_API_BASE_URL}/users/${recipientId}/details`;
            axios.get(userDetailsUrl)
              .then(res => {
                const recipientUser = res.data;
                setActiveConversation({
                  _id: `temp_${recipientId}`,
                  participants: [currentUser, recipientUser],
                  lastMessage: { content: 'Start a new conversation' }
                });
              })
              .catch(() => {
                setActiveConversation({
                  _id: `temp_${recipientId}`,
                  participants: [currentUser, { _id: recipientId, username: 'Unknown User' }],
                  lastMessage: { content: 'Start a new conversation' }
                });
              });
          }
        } else if (data.length > 0) {
          setActiveConversation(data[0]);
        }
      }
    }
  );

  // Fetch messages for active conversation
  const { data: messagesData, isLoading: isLoadingMessages, refetch: refetchMessages } = useQuery(
    ['messages', activeConversation?._id],
    async () => {
      if (!activeConversation?._id || activeConversation._id.startsWith('temp_')) return [];
      const url = `${import.meta.env.VITE_API_BASE_URL}/messages/${activeConversation._id}`;
      const response = await axios.get(url);
      return response.data;
    },
    {
      enabled: !!activeConversation && !activeConversation._id.startsWith('temp_'),
      onSuccess: (data) => setMessages(data),
    }
  );

  // Auto-scroll chat container to bottom
  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  // Socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    socket.current = io(import.meta.env.VITE_API_BASE_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.current.on('connect', () => console.log('Connected to chat server'));

    const handleNewMessage = (message) => {
      if (message.conversationId === activeConversation?._id) {
        setMessages(prev => {
          if (!prev.find(m => m._id === message._id)) return [...prev, message];
          return prev;
        });
      }
    };

    socket.current?.on('newMessage', handleNewMessage);
    return () => {
      socket.current?.off('newMessage', handleNewMessage);
      socket.current?.disconnect();
    };
  }, [activeConversation?._id]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !activeConversation || isSending) return;

    const receiver = activeConversation.participants.find(p => p._id !== currentUser._id);
    if (!receiver) return;
    setIsSending(true);

    try {
      if (attachment) {
        const formData = new FormData();
        formData.append('file', attachment);
        formData.append('recipientId', receiver._id);
        if (newMessage.trim()) formData.append('content', newMessage);

        const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/messages/upload`;
        const response = await axios.post(uploadUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.success) {
          setNewMessage(''); setAttachment(null);
          if (attachmentInputRef.current) attachmentInputRef.current.value = '';
          if (activeConversation._id.startsWith('temp_') && response.data.conversation) {
            setActiveConversation(response.data.conversation);
          }
          refetchMessages();
        }
      } else {
        const messageData = { recipientId: receiver._id, content: newMessage };
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/messages/send`, messageData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.success) {
          setNewMessage('');
          setMessages(prev => {
            if (!prev.find(m => m._id === response.data.message._id)) return [...prev, response.data.message];
            return prev;
          });
          if (activeConversation._id.startsWith('temp_')) setActiveConversation(response.data.conversation);
        }
      }} catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = (convo) => convo.participants?.find(p => p._id !== currentUser._id);
  const handleAttachmentClick = () => attachmentInputRef.current?.click();
  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') setAttachment(file);
    else { alert('Please select a PDF file'); if (attachmentInputRef.current) attachmentInputRef.current.value = ''; }
  };
  const handleRemoveAttachment = () => { setAttachment(null); if (attachmentInputRef.current) attachmentInputRef.current.value = ''; };

  if (isLoadingConversations) return <div className="min-h-screen flex items-center justify-center p-12">Loading conversations...</div>;

  const displayedConversations = [...conversations];
  if (activeConversation?._id.startsWith('temp_') && !conversations.find(c => c._id === activeConversation._id)) {
    displayedConversations.unshift(activeConversation);
  }

  const otherUser = activeConversation ? getOtherParticipant(activeConversation) : null;

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className={clsx('w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col', activeConversation ? 'hidden md:flex' : 'flex')}>
        <div className="p-4 border-b"><h2 className="text-xl font-bold">Inbox</h2></div>
        <div className="overflow-y-auto flex-grow">
          {displayedConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            displayedConversations.map(convo => {
              const other = getOtherParticipant(convo);
              return (
                <div key={convo._id} onClick={() => setActiveConversation(convo)} className={clsx('p-4 cursor-pointer hover:bg-gray-50 border-b', activeConversation?._id === convo._id && 'bg-blue-50 border-blue-200')}>
                  <div className="font-semibold truncate">{other?.username || 'User'}</div>
                  <p className="text-sm text-gray-600 truncate">{convo.lastMessage?.content || 'No messages yet'}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat */}
      <div className={clsx('relative flex-1 flex flex-col', activeConversation ? 'flex' : 'hidden md:flex')}>
        <div className="flex items-center p-4 bg-white border-b border-gray-200">
          <button onClick={() => setActiveConversation(null)} className="md:hidden mr-4 text-gray-600 hover:text-gray-900"><ArrowLeft className="h-6 w-6" /></button>
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3"><User className="h-6 w-6 text-gray-500" /></div>
          <div className="flex-1"><h3 className="text-lg font-semibold">{otherUser?.username || 'New Message'}</h3></div>
        </div>

        {activeConversation && otherUser ? (
          <div ref={chatContainerRef} className="flex-1 min-h-0 p-4 md:p-6 overflow-y-auto bg-gray-50 pb-16">
            {isLoadingMessages ? (
              <div className="flex justify-center items-center h-full text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500 text-center"><p>No messages yet</p><p className="text-sm">Start the conversation!</p></div>
            ) : (
              <div className="space-y-4">
                {messages.map(msg => (
                  <div key={msg._id || msg.tempId} className={clsx('flex', msg.sender?._id === currentUser._id ? 'justify-end' : 'justify-start')}>
                    <div className={clsx('max-w-xs lg:max-w-md px-4 py-2 rounded-lg', msg.sender?._id === currentUser._id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200')}>
                      {msg.attachmentUrl ? (
                        <div>
                          <a href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${msg.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                            <FileText className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span className="truncate">{msg.content || msg.attachmentUrl.split('/').pop()}</span>
                          </a>
                          {msg.content && !msg.content.includes('.pdf') && <p className="mt-1">{msg.content}</p>}
                        </div>
                      ) : <p>{msg.content}</p>}
                      <div className="text-xs mt-1 opacity-75">{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full text-gray-500 bg-gray-50 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Select a conversation or start a new one</p>
          </div>
        )}

        {/* Input */}
        <div className="absolute bottom-0 w-full bg-white p-1 border-t">
          {attachment && (
            <div className="mb-2 flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-md">
              <div className="flex items-center truncate"><Paperclip className="h-4 w-4 mr-2 text-blue-600" /> <span className="truncate text-sm text-blue-800">{attachment.name}</span></div>
              <button onClick={handleRemoveAttachment} className="ml-2 text-gray-500 hover:text-gray-700"><X className="h-4 w-4" /></button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input type="file" ref={attachmentInputRef} onChange={handleAttachmentChange} className="hidden" accept=".pdf,application/pdf" />
            <button type="button" onClick={handleAttachmentClick} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"><Paperclip className="h-5 w-5" /></button>
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={activeConversation ? "Type a message..." : "Select a conversation to message"} className="flex-1 mx-1 px-2 py-1 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={isSending || !activeConversation} />
            <button type="submit" disabled={(!newMessage.trim() && !attachment) || isSending || !activeConversation} className={clsx('p-2 rounded-full text-white transition-colors', (!newMessage.trim() && !attachment) || isSending || !activeConversation ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700')}>
              {isSending ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="h-5 w-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
