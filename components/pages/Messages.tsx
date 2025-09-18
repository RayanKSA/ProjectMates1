
import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../services/apiService';
import type { Conversation, Message } from '../../types';
import { SendIcon } from '../Icons';

interface MessagesProps {
  userId: string;
}

const Messages: React.FC<MessagesProps> = ({ userId }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Note: The new apiService returns an empty array for now.
        // This component will appear empty until messaging is fully implemented in Firestore.
        apiService.getConversations().then(data => {
            setConversations(data);
            if (data.length > 0) {
                handleSelectConversation(data[0]);
            }
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setMessages([]); // Clear previous messages
        apiService.getMessages(conversation.id).then(setMessages);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !selectedConversation) return;

        apiService.sendMessage(selectedConversation.id, newMessage).then(sentMessage => {
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
        });
    };
    
    if(isLoading) {
        return <div className="flex-grow flex items-center justify-center text-gray-500 dark:text-gray-400">Loading conversations...</div>
    }

    return (
        <div className="h-[calc(100vh-10rem)] bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex">
            {/* Conversation List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-gray-200">Messages</h2>
                    <input type="text" placeholder="Search chats..." className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white" />
                </div>
                <div className="flex-grow overflow-y-auto">
                    {conversations.length === 0 && (
                        <p className="p-4 text-center text-gray-500 dark:text-gray-400">No conversations yet. Messaging feature coming soon!</p>
                    )}
                    {conversations.map(convo => (
                        <div key={convo.id} onClick={() => handleSelectConversation(convo)} className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedConversation?.id === convo.id ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}`}>
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3 relative ${convo.participant.isOnline ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'}`}>
                                {convo.participant.avatarInitial}
                                {convo.participant.isOnline && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800"></span>}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <p className="font-semibold dark:text-gray-200">{convo.participant.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{convo.lastMessage.text}</p>
                            </div>
                            <div className="text-right ml-2 flex-shrink-0">
                                <p className="text-xs text-gray-400 dark:text-gray-500">{convo.lastMessage.timestamp}</p>
                                {convo.unreadCount > 0 && <span className="mt-1 inline-block bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">{convo.unreadCount}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Message View */}
            <div className="w-2/3 flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold dark:text-gray-200">{selectedConversation.participant.name}</h3>
                            <span className={`text-sm font-medium flex items-center gap-2 ${selectedConversation.participant.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                <span className={`h-2.5 w-2.5 rounded-full ${selectedConversation.participant.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                {selectedConversation.participant.isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <div className="flex-grow p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                            <div className="space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.senderId === userId ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-xs mt-1 text-right ${msg.senderId === userId ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>{msg.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
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
