import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../services/apiService';
import type { Conversation, Message, User, ConversationParticipant } from '../../types';
import { SendIcon } from '../Icons';
import { Timestamp } from 'firebase/firestore';

interface MessagesProps {
  currentUser: User;
  startChatWith: User | null;
  onChatStarted: () => void;
}

const formatTimestamp = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '';
    return new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const Messages: React.FC<MessagesProps> = ({ currentUser, startChatWith, onChatStarted }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = apiService.getConversations(fetchedConversations => {
            // Sort conversations client-side to handle null timestamps gracefully
            const sortedConversations = [...fetchedConversations].sort((a, b) => {
                const aTime = a.lastMessage?.timestamp?.toMillis() || 0;
                const bTime = b.lastMessage?.timestamp?.toMillis() || 0;
                return bTime - aTime;
            });
            setConversations(sortedConversations);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser.id]);

    useEffect(() => {
        if (startChatWith) {
            const handleStartChat = async () => {
                const conversationId = await apiService.findOrCreateConversation(currentUser, startChatWith);
                setSelectedConversationId(conversationId);
                onChatStarted();
            };
            handleStartChat();
        }
    }, [startChatWith, currentUser, onChatStarted]);

    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        };

        const unsubscribe = apiService.getMessages(selectedConversationId, setMessages);
        return () => unsubscribe();
    }, [selectedConversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !selectedConversationId) return;
        
        await apiService.sendMessage(selectedConversationId, newMessage);
        setNewMessage('');
    };
    
    const selectedConversation = conversations.find(c => c.id === selectedConversationId);
    
    const getConversationDisplay = (convo: Conversation): {name: string, avatarInitial: string} => {
        if (convo.isGroupChat) {
            return {
                name: convo.groupName || 'Team Chat',
                avatarInitial: (convo.groupName || 'T').charAt(0).toUpperCase(),
            };
        }
        const otherParticipantId = convo.participantIds.find(id => id !== currentUser.id);
        const otherParticipant = otherParticipantId ? convo.participants[otherParticipantId] : null;
        return {
            name: otherParticipant?.name || 'Unknown User',
            avatarInitial: otherParticipant?.avatarInitial || '?',
        };
    }

    if(isLoading) {
        return <div className="h-[calc(100vh-10rem)] flex items-center justify-center text-gray-500 dark:text-gray-400">Loading conversations...</div>
    }

    return (
        <div className="h-[calc(100vh-10rem)] bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex">
            {/* Conversation List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-gray-200">Messages</h2>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {conversations.length === 0 && (
                        <p className="p-4 text-center text-gray-500 dark:text-gray-400">No conversations yet.</p>
                    )}
                    {conversations.map(convo => {
                        const display = getConversationDisplay(convo);
                        return (
                            <div key={convo.id} onClick={() => setSelectedConversationId(convo.id)} className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedConversationId === convo.id ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}`}>
                                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3 relative ${convo.isGroupChat ? 'bg-purple-600' : 'bg-gray-500'}`}>
                                    {display.avatarInitial}
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-semibold dark:text-gray-200">{display.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{convo.lastMessage?.text || 'No messages yet'}</p>
                                </div>
                                {convo.lastMessage && (
                                  <div className="text-right ml-2 flex-shrink-0">
                                      <p className="text-xs text-gray-400 dark:text-gray-500">{formatTimestamp(convo.lastMessage.timestamp)}</p>
                                  </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Message View */}
            <div className="w-2/3 flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold dark:text-gray-200">{getConversationDisplay(selectedConversation).name}</h3>
                        </div>
                        <div className="flex-grow p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                            <div className="space-y-4">
                                {messages.map(msg => {
                                    const isMyMessage = msg.senderId === currentUser.id;
                                    const sender = selectedConversation.isGroupChat ? selectedConversation.participants[msg.senderId] : null;
                                    return (
                                        <div key={msg.id} className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                            {selectedConversation.isGroupChat && !isMyMessage && sender && (
                                                <div title={sender.name} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gray-400 flex-shrink-0">
                                                    {sender.avatarInitial}
                                                </div>
                                            )}
                                            <div className={`flex flex-col max-w-xs lg:max-w-md ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                                {selectedConversation.isGroupChat && !isMyMessage && sender && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-3 mb-1">{sender.name}</p>
                                                )}
                                                <div className={`p-3 rounded-lg ${isMyMessage ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                                    <p>{msg.text}</p>
                                                    <p className={`text-xs mt-1 text-right ${isMyMessage ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>{formatTimestamp(msg.timestamp)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <form onSubmit={handleSendMessage} className="flex items-center">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                                />
                                <button type="submit" className="ml-3 p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={!newMessage.trim()}>
                                    <SendIcon className="h-6 w-6" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;