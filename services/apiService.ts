
import { auth, db } from '../firebase';
import {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    limit,
    updateDoc,
} from 'firebase/firestore';
// FIX: Import Conversation and Message types and mock data for new functions.
import type { User, Invitation, Conversation, Message } from '../types';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_USERS } from '../constants';


const getCurrentUserId = (): string => {
    if (!auth.currentUser) {
        throw new Error("No authenticated user found");
    }
    return auth.currentUser.uid;
}

// FIX: Define SearchParams type for searchUsers function.
interface SearchParams {
    name: string;
    skill: string;
    interest: string;
    availability: string;
}

export const apiService = {
    // Fetches a user profile from Firestore
    getUserProfile: async (userId: string): Promise<User | null> => {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            // Note: We are casting here. For production, you'd want schema validation (e.g., with Zod).
            return { id: userDocSnap.id, ...userDocSnap.data() } as User;
        }
        return null;
    },

    // FIX: Add updateUserProfile function to update user data in Firestore.
    updateUserProfile: async (profileData: Partial<User>): Promise<void> => {
        const userId = getCurrentUserId();
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, profileData);
    },

    getSuggestedTeammates: async (): Promise<User[]> => {
        const currentUserId = getCurrentUserId();
        const usersRef = collection(db, 'users');
        // Query for 4 users who are not the current user and are looking for a team
        const q = query(
            usersRef,
            where('id', '!=', currentUserId),
            where('teamStatus', '==', 'Looking for a team'),
            limit(4)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    },

    getTeamStatus: async (): Promise<{ team: null, invitations: Invitation[] }> => {
        // This is a placeholder. A full implementation would query an 'invitations' collection
        // where the current user's ID is the recipient.
        return Promise.resolve({
            team: null,
            invitations: [], 
        });
    },

    // FIX: Add searchUsers function to filter mock users based on criteria.
    searchUsers: async (params: SearchParams): Promise<User[]> => {
        // Mock implementation filtering MOCK_USERS
        try {
            const currentUserId = getCurrentUserId();
            const { name, skill, interest } = params;
            let filteredUsers = MOCK_USERS.filter(u => u.id !== currentUserId);
    
            if (name) {
                filteredUsers = filteredUsers.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
            }
            if (skill && skill !== 'Any Skill') {
                filteredUsers = filteredUsers.filter(user => user.skills.includes(skill));
            }
            if (interest && interest !== 'Any Interest') {
                filteredUsers = filteredUsers.filter(user => user.interests.includes(interest));
            }
            return Promise.resolve(filteredUsers);
        } catch (error) {
            // If no user is logged in, return empty array to prevent crashes.
            console.warn("searchUsers called without authenticated user.");
            return Promise.resolve([]);
        }
    },
    
    // FIX: Add getConversations to return mock conversation data.
    getConversations: async (): Promise<Conversation[]> => {
        return Promise.resolve(MOCK_CONVERSATIONS);
    },

    // FIX: Add getMessages to return mock message data for a conversation.
    getMessages: async (conversationId: string): Promise<Message[]> => {
        return Promise.resolve(MOCK_MESSAGES[conversationId] || []);
    },

    // FIX: Add sendMessage to simulate sending a message.
    sendMessage: async (conversationId: string, text: string): Promise<Message> => {
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: getCurrentUserId(),
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        // This is a mock. In a real app, you'd persist this and update state.
        if (MOCK_MESSAGES[conversationId]) {
            MOCK_MESSAGES[conversationId].push(newMessage);
        } else {
            MOCK_MESSAGES[conversationId] = [newMessage];
        }
        return Promise.resolve(newMessage);
    },
};
