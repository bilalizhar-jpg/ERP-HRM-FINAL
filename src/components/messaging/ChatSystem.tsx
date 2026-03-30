import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Hash, 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Video, 
  Info, 
  Plus,
  User as UserIcon,
  Circle,
  X
} from 'lucide-react';
import { Employee, User } from '../../types';
import { fetchWithRetry } from '../../utils/fetchWithRetry';

interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  type: 'text' | 'image' | 'file';
  created_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  reactions: string | null;
  parent_id: number | null;
}

interface Chat {
  id: number;
  type: 'one-to-one' | 'group' | 'channel';
  name?: string;
  last_message?: string;
  last_message_at?: string;
}

export default function ChatSystem() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; profile_picture?: string; isGuest?: boolean; chat_id?: number; company_id?: number } | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [threadParent, setThreadParent] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    const lastWord = value.split(' ').pop() || '';
    if (lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionFilter(lastWord.slice(1));
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (employee: Employee) => {
    const words = newMessage.split(' ');
    words.pop();
    setNewMessage([...words, `@${employee.name} `].join(' '));
    setShowMentions(false);
  };

  const handleAddReaction = async (messageId: number, emoji: string) => {
    if (!currentUser) return;
    try {
      await fetchWithRetry('/api/messages/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, user_id: currentUser.id, emoji })
      });
      // Update local state or re-fetch messages
      fetchMessages(activeChat!.id);
      socket?.emit('reaction_added', { message_id: messageId, chat_id: activeChat!.id });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const parseReactions = (reactionsStr: string | null) => {
    if (!reactionsStr) return {};
    const reactions: { [emoji: string]: number[] } = {};
    reactionsStr.split(',').forEach(r => {
      const [emoji, userId] = r.split(':');
      if (!reactions[emoji]) reactions[emoji] = [];
      reactions[emoji].push(parseInt(userId));
    });
    return reactions;
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat || !currentUser) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetchWithRetry('/api/messages/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        const messageData = {
          chat_id: activeChat.id,
          sender_id: currentUser.id,
          content: data.fileUrl,
          type: data.fileType.startsWith('image/') ? 'image' : 'file',
          file_name: data.fileName
        };

        const msgRes = await fetchWithRetry('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData)
        });
        const msgData = await msgRes.json();

        if (msgData.success) {
          const fullMessage: Message = {
            chat_id: activeChat.id,
            sender_id: currentUser.id,
            content: data.fileUrl,
            type: data.fileType.startsWith('image/') ? 'image' : 'file',
            id: msgData.message_id,
            sender_name: currentUser.name,
            sender_avatar: currentUser.profile_picture,
            created_at: new Date().toISOString(),
            is_edited: false,
            is_deleted: false,
            reactions: null,
            parent_id: null
          } as Message;

          socket?.emit('send_message', fullMessage);
          setMessages(prev => [...prev, fullMessage]);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleEditMessage = async (id: number, content: string) => {
    try {
      await fetchWithRetry(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, content, is_edited: true } : m));
      setEditingMessage(null);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await fetchWithRetry(`/api/messages/${id}`, { method: 'DELETE' });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_deleted: true } : m));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleInviteGuest = async () => {
    if (!activeChat || !currentUser || !inviteEmail) return;
    try {
      const res = await fetchWithRetry('/api/messages/invite-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: activeChat.id,
          email: inviteEmail,
          invited_by: currentUser.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setInviteLink(data.inviteLink);
      }
    } catch (error) {
      console.error('Error inviting guest:', error);
    }
  };

  const [typingUsers, setTypingUsers] = useState<{[key: number]: string}>({});

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchChats = useCallback(async (userId: number) => {
    try {
      const res = await fetchWithRetry(`/api/messages/chats?user_id=${userId}`);
      const data = await res.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, []);

  const fetchEmployees = useCallback(async (companyId: number) => {
    try {
      const res = await fetchWithRetry(`/api/messages/employees?company_id=${companyId}`);
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, []);

  const fetchMessages = useCallback(async (chatId: number) => {
    try {
      const res = await fetchWithRetry(`/api/messages/${chatId}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  const markMessagesAsRead = useCallback(async (chatId: number) => {
    if (!currentUser) return;
    try {
      await fetchWithRetry(`/api/messages/read/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id })
      });
      socket?.emit('messages_read', { chat_id: chatId, user_id: currentUser.id });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [currentUser, socket]);

  useEffect(() => {
    const employeeId = localStorage.getItem('employeeId');
    const guestData = localStorage.getItem('guest');
    
    const initializeUser = (user: User | null) => {
      if (!user) return;
      setCurrentUser(user);
      
      // Initialize socket
      const newSocket = io();
      setSocket(newSocket);

      // Fetch initial data
      if (!user.isGuest) {
        fetchChats(user.id);
        if (user.company_id) {
          fetchEmployees(user.company_id);
        }
      } else if (user.chat_id) {
        // Guest only sees the chat they were invited to
        const guestChat: Chat = {
          id: user.chat_id,
          type: 'group', // or whatever type the invite was for
          name: 'Guest Chat'
        };
        setChats([guestChat]);
        setActiveChat(guestChat);
        fetchMessages(guestChat.id);
      }

      return () => {
        newSocket.close();
      };
    };

    if (employeeId) {
      fetchWithRetry(`/api/employees/${employeeId}`)
        .then(async res => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        })
        .then(data => {
          if (data.success) {
            initializeUser(data.employee);
          }
        })
        .catch(err => console.error("Error fetching employee for chat:", err));
    } else if (guestData) {
      const user = JSON.parse(guestData);
      initializeUser(user);
    }
  }, [fetchMessages, fetchChats, fetchEmployees]);

  const handleTyping = () => {
    if (!socket || !activeChat || !currentUser) return;
    socket.emit('typing', { chat_id: activeChat.id, user_id: currentUser.id, user_name: currentUser.name });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleChatSelect = useCallback((chat: Chat) => {
    setActiveChat(chat);
    fetchMessages(chat.id);
    markMessagesAsRead(chat.id);
  }, [fetchMessages, markMessagesAsRead]);

  useEffect(() => {
    if (socket && activeChat) {
      socket.emit('join_chat', activeChat.id);

      socket.on('receive_message', (message: Message) => {
        if (message.chat_id === activeChat.id) {
          setMessages(prev => [...prev, message]);
          markMessagesAsRead(activeChat.id);
        }
      });

      socket.on('user_typing', (data: { chat_id: number, user_id: number, user_name: string }) => {
        if (data.chat_id === activeChat.id) {
          setTypingUsers(prev => ({ ...prev, [data.user_id]: data.user_name }));
          setTimeout(() => {
            setTypingUsers(prev => {
              const next = { ...prev };
              delete next[data.user_id];
              return next;
            });
          }, 3000);
        }
      });

      return () => {
        socket.off('receive_message');
        socket.off('user_typing');
      };
    }
  }, [socket, activeChat, markMessagesAsRead]);

  const startMeeting = () => {
    if (!activeChat || !currentUser) return;
    const roomName = `erp-meeting-${activeChat.id}-${Date.now()}`;
    const meetingUrl = `https://meet.jit.si/${roomName}`;
    
    const messageData = {
      chat_id: activeChat.id,
      sender_id: currentUser.id,
      content: `Meeting started: ${meetingUrl}`,
      type: 'text'
    };

    fetchWithRetry('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    }).then(res => res.json()).then(data => {
      if (data.success) {
        const fullMessage: Message = {
          ...messageData,
          id: data.message_id,
          sender_name: currentUser.name,
          sender_avatar: currentUser.profile_picture,
          created_at: new Date().toISOString(),
          is_edited: false,
          is_deleted: false,
          reactions: null
        } as Message;
        socket?.emit('send_message', fullMessage);
        setMessages(prev => [...prev, fullMessage]);
      }
    });

    window.open(meetingUrl, '_blank');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !currentUser) return;

    const messageData = {
      chat_id: activeChat.id,
      sender_id: currentUser.id,
      content: newMessage,
      type: 'text',
      parent_id: threadParent?.id || null
    };

    try {
      const res = await fetchWithRetry('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      const data = await res.json();

      if (data.success) {
        const fullMessage: Message = {
          ...messageData,
          id: data.message_id,
          sender_name: currentUser.name,
          sender_avatar: currentUser.profile_picture,
          created_at: new Date().toISOString(),
          is_edited: false,
          is_deleted: false,
          reactions: null
        } as Message;

        socket?.emit('send_message', fullMessage);
        setMessages(prev => [...prev, fullMessage]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startDM = async (employeeId: number) => {
    if (!currentUser) return;
    try {
      const res = await fetchWithRetry('/api/messages/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1_id: currentUser.id, user2_id: employeeId })
      });
      const data = await res.json();
      if (data.success) {
        const chat = chats.find(c => c.id === data.chat_id) || {
          id: data.chat_id,
          type: 'one-to-one',
          name: employees.find(e => e.id === employeeId)?.name
        } as Chat;
        handleChatSelect(chat);
        fetchChats(currentUser.id);
      }
    } catch (error) {
      console.error('Error starting DM:', error);
    }
  };

  return (
    <div className="flex h-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-black text-white tracking-tight uppercase">Messages</h2>
          <button className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Channels */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Channels</span>
              <button className="hover:text-white"><Plus size={14} /></button>
            </div>
            <div className="space-y-1">
              {chats.filter(c => c.type === 'channel').map(chat => (
                <button
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    activeChat?.id === chat.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
                  }`}
                >
                  <Hash size={18} />
                  <span className="font-medium truncate">{chat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Direct Messages</span>
              <button className="hover:text-white"><Plus size={14} /></button>
            </div>
            <div className="space-y-1">
              {employees.filter(e => e.id !== currentUser?.id).map(emp => (
                <button
                  key={emp.id}
                  onClick={() => startDM(emp.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 transition-all group"
                >
                  <div className="relative">
                    {emp.profile_picture ? (
                      <img src={emp.profile_picture} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {emp.name.charAt(0)}
                      </div>
                    )}
                    <Circle size={10} className="absolute -bottom-0.5 -right-0.5 text-emerald-500 fill-emerald-500 border-2 border-slate-900" />
                  </div>
                  <span className="font-medium truncate group-hover:text-white">{emp.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
              {currentUser?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 truncate">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  {activeChat.type === 'channel' ? <Hash size={20} /> : <UserIcon size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">
                    {activeChat.name || employees.find(e => e.id === chats.find(c => c.id === activeChat.id)?.id)?.name || 'Direct Message'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Circle size={8} className="text-emerald-500 fill-emerald-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Now</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={startMeeting}
                  className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                  title="Start Meeting"
                >
                  <Video size={20} />
                </button>
                {!currentUser?.isGuest && (
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                    title="Invite Guest"
                  >
                    <Plus size={20} />
                  </button>
                )}
                <button className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                  <Info size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === currentUser?.id;
                const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;

                return (
                  <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                      {msg.sender_avatar ? (
                        <img src={msg.sender_avatar} alt={msg.sender_name} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                          {msg.sender_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {showAvatar && (
                        <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{msg.sender_name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      <div className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm relative group ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                      }`}>
                        {editingMessage === msg.id ? (
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.target as HTMLFormElement;
                              const input = form.elements.namedItem('content') as HTMLInputElement;
                              handleEditMessage(msg.id, input.value);
                            }}
                            className="flex items-center gap-2"
                          >
                            <input 
                              name="content"
                              type="text" 
                              defaultValue={msg.content}
                              className="flex-1 bg-slate-50 border-none rounded-lg px-3 py-1 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600"
                              autoFocus
                            />
                            <button type="submit" className="text-blue-600 font-bold text-xs uppercase tracking-widest">Save</button>
                            <button type="button" onClick={() => setEditingMessage(null)} className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cancel</button>
                          </form>
                        ) : msg.is_deleted ? (
                          <span className="italic opacity-50">This message was deleted</span>
                        ) : msg.type === 'image' ? (
                          <img src={msg.content} alt="Upload" className="max-w-xs rounded-lg" />
                        ) : msg.type === 'file' ? (
                          <a href={msg.content} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline">
                            <Paperclip size={16} />
                            {msg.content.split('/').pop()}
                          </a>
                        ) : (
                          msg.content
                        )}
                        {msg.is_edited && !msg.is_deleted && (
                          <span className="text-[10px] opacity-50 ml-2">(edited)</span>
                        )}

                        {/* Reactions Display */}
                        {msg.reactions && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(parseReactions(msg.reactions)).map(([emoji, userIds]) => (
                              <button
                                key={emoji}
                                onClick={() => handleAddReaction(msg.id, emoji)}
                                className={`px-2 py-0.5 rounded-full text-xs font-bold border transition-all ${
                                  userIds.includes(currentUser?.id as number) 
                                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                }`}
                              >
                                {emoji} {userIds.length}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Message Actions */}
                        {!msg.is_deleted && (
                          <div className={`absolute -top-8 ${isMe ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-1 bg-white shadow-lg rounded-lg p-1 border border-slate-100 z-10`}>
                            <button 
                              onClick={() => setShowEmojiPicker(msg.id)}
                              className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-amber-500 rounded transition-colors"
                            >
                              <Smile size={14} />
                            </button>
                            <button 
                              onClick={() => setThreadParent(msg)}
                              className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            >
                              <MessageSquare size={14} />
                            </button>
                            {isMe && (
                              <>
                                <button 
                                  onClick={() => setEditingMessage(msg.id)}
                                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                >
                                  <MoreVertical size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        )}

                        {/* Emoji Picker Popover */}
                        {showEmojiPicker === msg.id && (
                          <div className="absolute -top-12 left-0 bg-white shadow-xl rounded-xl p-2 border border-slate-100 z-20 flex gap-2">
                            {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                              <button 
                                key={emoji}
                                onClick={() => {
                                  handleAddReaction(msg.id, emoji);
                                  setShowEmojiPicker(null);
                                }}
                                className="text-xl hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-8 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="relative">
                {showMentions && (
                  <div className="absolute bottom-full left-0 w-64 bg-white shadow-2xl rounded-2xl border border-slate-100 mb-2 overflow-hidden z-50">
                    <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mention Someone</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {employees.filter(e => e.name.toLowerCase().includes(mentionFilter.toLowerCase())).map(emp => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => insertMention(emp)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group text-left"
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-100 group-hover:text-blue-600">
                            {emp.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{emp.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    handleInputChange(e);
                    handleTyping();
                  }}
                  placeholder={`Message ${activeChat.name || 'this chat'}...`}
                  className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-32 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button type="button" className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button type="button" className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                    <Smile size={20} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                  >
                    <Paperclip size={20} />
                  </button>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
              <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Press Enter to send
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-blue-100">
              <MessageSquare size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Welcome to Messages</h3>
            <p className="text-slate-500 max-w-sm font-medium">
              Select a channel or direct message from the sidebar to start communicating with your team.
            </p>
            <button className="mt-8 px-8 py-4 bg-blue-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Start a Conversation
            </button>
          </div>
        )}
      </div>
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Invite Guest</h3>
            <p className="text-slate-500 font-medium mb-8">Invite someone outside the ERP to join this conversation.</p>
            
            <div className="space-y-6">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Guest Email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>

              {inviteLink && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2">Invite Link Generated</p>
                  <input 
                    readOnly 
                    value={inviteLink}
                    className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs text-slate-600 font-mono"
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteLink('');
                    setInviteEmail('');
                  }}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Close
                </button>
                {!inviteLink && (
                  <button 
                    onClick={handleInviteGuest}
                    className="flex-1 py-4 bg-blue-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    Generate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thread Sidebar */}
      {threadParent && (
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Thread</h3>
            <button onClick={() => setThreadParent(null)} className="p-1 hover:bg-slate-100 rounded">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Parent Message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{threadParent.sender_name}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(threadParent.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{threadParent.content}</p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Replies</span>
            </div>
            {/* Replies */}
            {messages.filter(m => m.parent_id === threadParent.id).map(reply => (
              <div key={reply.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{reply.sender_name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
              <input 
                type="text" 
                placeholder="Reply..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
