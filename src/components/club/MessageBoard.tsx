import React, { useState } from 'react';
import { useUser , User } from '../../contexts/UserContext';
import { MessageSquare, ThumbsUp, Flag, Trash2, Edit, Filter, ChevronDown, Send, Image, MapPin } from 'react-feather';

interface MessageBoardProps {
  clubId: string;
  isAdmin: boolean;
  currentUser: User | null;
}

// Mock message data
interface Message {
  id: string;
  content: string;
  authorId: string;
  timestamp: string;
  likes: string[]; // User IDs who liked this post
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  replies?: Message[];
  isReported?: boolean;
}

const initialMessages: Message[] = [
  {
    id: 'msg1',
    content: 'I spotted a 10-point buck near the west food plot this morning. Anyone else seeing good deer movement?',
    authorId: 'hunter1',
    timestamp: 'Mar 15, 2025 - 6:45 AM',
    likes: ['admin', 'hunter2'],
    location: {
      latitude: 34.567,
      longitude: -85.432,
      name: 'West Food Plot'
    },
    replies: [
      {
        id: 'reply1',
        content: 'Nice! I saw a good group of does in the same area yesterday evening.',
        authorId: 'hunter2',
        timestamp: 'Mar 15, 2025 - 7:30 AM',
        likes: ['hunter1']
      }
    ]
  },
  {
    id: 'msg2',
    content: 'Has anyone tried the new north stand? I fixed the steps last weekend and added some camo netting.',
    authorId: 'admin',
    timestamp: 'Mar 14, 2025 - 4:20 PM',
    likes: [],
    images: ['https://same-assets.com/69dffadf-8325-4c54-b7e2-16dc8246bf84.jpeg'],
    location: {
      latitude: 34.572,
      longitude: -85.429,
      name: 'North Ridge Stand'
    },
    replies: []
  },
  {
    id: 'msg3',
    content: 'Who\'s coming to the work weekend on April 15th? I\'ll be bringing my tractor and brush hog.',
    authorId: 'hunter2',
    timestamp: 'Mar 13, 2025 - 7:15 PM',
    likes: ['admin'],
    replies: [
      {
        id: 'reply2',
        content: 'I\'ll be there. I can bring my chainsaw and pole saw.',
        authorId: 'hunter1',
        timestamp: 'Mar 13, 2025 - 8:45 PM',
        likes: []
      },
      {
        id: 'reply3',
        content: 'Thanks for volunteering, guys. We\'ll need to clear some shooting lanes and repair a couple of stands.',
        authorId: 'admin',
        timestamp: 'Mar 13, 2025 - 9:10 PM',
        likes: ['hunter1', 'hunter2']
      }
    ]
  }
];

const MessageBoard: React.FC<MessageBoardProps> = ({ clubId, isAdmin, currentUser }) => {
  const { allUsers } = useUser();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [filter, setFilter] = useState('all');

  const handlePostMessage = () => {
    if (!newMessage.trim() || !currentUser) return;

    const message: Message = {
      id: `msg${Date.now()}`,
      content: newMessage,
      authorId: currentUser.id,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      likes: [],
      replies: []
    };

    setMessages([message, ...messages]);
    setNewMessage('');
  };

  const handlePostReply = (messageId: string) => {
    if (!replyContent.trim() || !currentUser) return;

    const reply: Message = {
      id: `reply${Date.now()}`,
      content: replyContent,
      authorId: currentUser.id,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      likes: []
    };

    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          replies: [...(msg.replies || []), reply]
        };
      }
      return msg;
    }));

    setReplyContent('');
    setReplyingTo(null);
  };

  const handleLikeMessage = (messageId: string, isReply = false, parentId?: string) => {
    if (!currentUser) return;

    if (!isReply) {
      setMessages(messages.map(msg => {
        if (msg.id === messageId) {
          const alreadyLiked = msg.likes.includes(currentUser.id);
          return {
            ...msg,
            likes: alreadyLiked
              ? msg.likes.filter(id => id !== currentUser.id)
              : [...msg.likes, currentUser.id]
          };
        }
        return msg;
      }));
    } else if (parentId) {
      setMessages(messages.map(msg => {
        if (msg.id === parentId && msg.replies) {
          return {
            ...msg,
            replies: msg.replies.map(reply => {
              if (reply.id === messageId) {
                const alreadyLiked = reply.likes.includes(currentUser.id);
                return {
                  ...reply,
                  likes: alreadyLiked
                    ? reply.likes.filter(id => id !== currentUser.id)
                    : [...reply.likes, currentUser.id]
                };
              }
              return reply;
            })
          };
        }
        return msg;
      }));
    }
  };

  const handleReportMessage = (messageId: string, isReply = false, parentId?: string) => {
    if (!isReply) {
      setMessages(messages.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            isReported: true
          };
        }
        return msg;
      }));
    } else if (parentId) {
      setMessages(messages.map(msg => {
        if (msg.id === parentId && msg.replies) {
          return {
            ...msg,
            replies: msg.replies.map(reply => {
              if (reply.id === messageId) {
                return {
                  ...reply,
                  isReported: true
                };
              }
              return reply;
            })
          };
        }
        return msg;
      }));
    }
  };

  const handleDeleteMessage = (messageId: string, isReply = false, parentId?: string) => {
    if (!isReply) {
      setMessages(messages.filter(msg => msg.id !== messageId));
    } else if (parentId) {
      setMessages(messages.map(msg => {
        if (msg.id === parentId && msg.replies) {
          return {
            ...msg,
            replies: msg.replies.filter(reply => reply.id !== messageId)
          };
        }
        return msg;
      }));
    }
  };

  const filteredMessages = () => {
    switch (filter) {
      case 'my-posts':
        return messages.filter(msg => msg.authorId === currentUser?.id);
      case 'with-photos':
        return messages.filter(msg => msg.images?.length);
      case 'with-location':
        return messages.filter(msg => msg.location);
      case 'reported':
        if (isAdmin) {
          return messages.filter(msg =>
            msg.isReported ||
            msg.replies?.some(reply => reply.isReported)
          );
        }
        return messages;
      default:
        return messages;
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm">
      {/* Message Board Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <MessageSquare size={20} className="mr-2" /> Message Board
          </h2>

          <div className="relative">
            <button className="flex items-center text-sm bg-gray-100 px-3 py-1 rounded-md">
              <Filter size={14} className="mr-1" />
              Filter
              <ChevronDown size={14} className="ml-1" />
            </button>

            <div className="absolute right-0 mt-1 w-36 bg-white shadow-md rounded-md border border-gray-200 z-10 hidden">
              <button
                className={`w-full text-left px-3 py-2 text-sm ${filter === 'all' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                onClick={() => setFilter('all')}
              >
                All Messages
              </button>
              <button
                className={`w-full text-left px-3 py-2 text-sm ${filter === 'my-posts' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                onClick={() => setFilter('my-posts')}
              >
                My Posts
              </button>
              <button
                className={`w-full text-left px-3 py-2 text-sm ${filter === 'with-photos' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                onClick={() => setFilter('with-photos')}
              >
                With Photos
              </button>
              <button
                className={`w-full text-left px-3 py-2 text-sm ${filter === 'with-location' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                onClick={() => setFilter('with-location')}
              >
                With Location
              </button>
              {isAdmin && (
                <button
                  className={`w-full text-left px-3 py-2 text-sm ${filter === 'reported' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  onClick={() => setFilter('reported')}
                >
                  Reported
                </button>
              )}
            </div>
          </div>
        </div>

        {/* New Message Input */}
        <div className="mb-2">
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            placeholder="Share an update, photo, or sighting with the club..."
            rows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          ></textarea>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button className="text-gray-500 hover:text-gray-700">
              <Image size={18} />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <MapPin size={18} />
            </button>
          </div>

          <button
            className="bg-green-600 text-white px-4 py-1 rounded-md flex items-center hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newMessage.trim()}
            onClick={handlePostMessage}
          >
            <Send size={16} className="mr-1" /> Post
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="divide-y divide-gray-200">
        {filteredMessages().length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
            <p>No messages to display</p>
            {filter !== 'all' && (
              <button
                className="text-green-600 hover:underline mt-2"
                onClick={() => setFilter('all')}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredMessages().map(message => (
            <div key={message.id} className={`p-4 ${message.isReported ? 'bg-red-50' : ''}`}>
              <div className="flex items-start">
                <div className="mr-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                    {allUsers[message.authorId]?.name?.charAt(0) || '?'}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{allUsers[message.authorId]?.name}</h3>
                      <p className="text-xs text-gray-500">{message.timestamp}</p>
                    </div>

                    <div className="flex space-x-1">
                      {(isAdmin || message.authorId === currentUser?.id) && (
                        <>
                          <button
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                          {message.authorId === currentUser?.id && (
                            <button className="text-gray-400 hover:text-gray-600">
                              <Edit size={14} />
                            </button>
                          )}
                        </>
                      )}
                      {message.authorId !== currentUser?.id && (
                        <button
                          className={`${message.isReported ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                          onClick={() => handleReportMessage(message.id)}
                          disabled={message.isReported}
                        >
                          <Flag size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-gray-800 whitespace-pre-line">{message.content}</p>

                    {message.images && message.images.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {message.images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Posted by ${allUsers[message.authorId]?.name}`}
                            className="rounded-md w-full h-32 object-cover"
                          />
                        ))}
                      </div>
                    )}

                    {message.location && (
                      <div className="mt-2 bg-gray-50 p-2 rounded-md flex items-center text-sm">
                        <MapPin size={14} className="text-gray-500 mr-1" />
                        <span>{message.location.name}</span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center space-x-4">
                      <button
                        className={`flex items-center text-sm ${message.likes.includes(currentUser?.id || '') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                        onClick={() => handleLikeMessage(message.id)}
                      >
                        <ThumbsUp size={14} className="mr-1" />
                        {message.likes.length > 0 && (
                          <span>{message.likes.length}</span>
                        )}
                      </button>

                      <button
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                        onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                      >
                        <MessageSquare size={14} className="mr-1" /> Reply
                      </button>
                    </div>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === message.id && (
                    <div className="mt-3 ml-6">
                      <div className="flex">
                        <textarea
                          className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                          placeholder="Write a reply..."
                          rows={2}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        ></textarea>
                        <button
                          className="ml-2 bg-green-600 text-white px-3 rounded-md flex items-center hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!replyContent.trim()}
                          onClick={() => handlePostReply(message.id)}
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {message.replies && message.replies.length > 0 && (
                    <div className="mt-3 ml-6 space-y-3">
                      {message.replies.map(reply => (
                        <div key={reply.id} className={`bg-gray-50 p-3 rounded-md ${reply.isReported ? 'bg-red-50' : ''}`}>
                          <div className="flex items-start">
                            <div className="mr-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-xs">
                                {allUsers[reply.authorId]?.name?.charAt(0) || '?'}
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-sm">{allUsers[reply.authorId]?.name}</h4>
                                  <p className="text-xs text-gray-500">{reply.timestamp}</p>
                                </div>

                                <div className="flex space-x-1">
                                  {(isAdmin || reply.authorId === currentUser?.id) && (
                                    <button
                                      className="text-gray-400 hover:text-gray-600"
                                      onClick={() => handleDeleteMessage(reply.id, true, message.id)}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                  {reply.authorId !== currentUser?.id && (
                                    <button
                                      className={`${reply.isReported ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                      onClick={() => handleReportMessage(reply.id, true, message.id)}
                                      disabled={reply.isReported}
                                    >
                                      <Flag size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <p className="text-sm text-gray-800 mt-1">{reply.content}</p>

                              <button
                                className={`mt-2 flex items-center text-xs ${reply.likes.includes(currentUser?.id || '') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                onClick={() => handleLikeMessage(reply.id, true, message.id)}
                              >
                                <ThumbsUp size={12} className="mr-1" />
                                {reply.likes.length > 0 && (
                                  <span>{reply.likes.length}</span>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageBoard;
