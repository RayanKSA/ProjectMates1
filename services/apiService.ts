import { auth, db, Timestamp, arrayUnion, writeBatch, arrayRemove } from '../firebase';
import {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    limit,
    updateDoc,
    setDoc,
    addDoc,
    orderBy,
    onSnapshot,
    deleteDoc,
} from 'firebase/firestore';
import type { User, Invitation, Conversation, Message, ConversationParticipant, Team } from '../types';
import { MOCK_USERS } from '../constants';


const getCurrentUserId = (): string => {
    if (!auth.currentUser) {
        throw new Error("No authenticated user found");
    }
    return auth.currentUser.uid;
}

export const apiService = {
    // Fetches a user profile from Firestore
    getUserProfile: async (userId: string): Promise<User | null> => {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            return { id: userDocSnap.id, ...userDocSnap.data() } as User;
        }
        return null;
    },

    getSuggestedTeammates: async (): Promise<User[]> => {
        const currentUserId = getCurrentUserId();
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            where('id', '!=', currentUserId),
            where('teamStatus', '==', 'Looking for a team'),
            limit(4)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    },

    searchUsers: async (filters: { name?: string; skill?: string; interest?: string; availability?: string }): Promise<User[]> => {
        const currentUserId = getCurrentUserId();
        const usersRef = collection(db, 'users');
        
        const queries = [where('id', '!=', currentUserId)];

        if (filters.skill && filters.skill !== 'Any Skill') {
            queries.push(where('skills', 'array-contains', filters.skill));
        }
        if (filters.interest && filters.interest !== 'Any Interest') {
            queries.push(where('interests', 'array-contains', filters.interest));
        }
        if (filters.availability && filters.availability !== 'Any') {
            const status = filters.availability === 'Available' ? 'Looking for a team' : 'In a team';
            queries.push(where('teamStatus', '==', status));
        }

        const q = query(usersRef, ...queries);
        const querySnapshot = await getDocs(q);
        
        let users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        
        if (filters.name) {
            users = users.filter(u => u.name.toLowerCase().includes(filters.name!.toLowerCase()));
        }

        return users;
    },

    updateUserProfile: async (userId: string, profileData: Partial<User>): Promise<User> => {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, profileData);
        
        const updatedUser = await apiService.getUserProfile(userId);
        if(!updatedUser) {
            throw new Error("Could not retrieve updated user profile.");
        }
        return updatedUser;
    },
    
    // --- TEAM MANAGEMENT & INVITATIONS ---

    createTeam: async (teamName: string, owner: User): Promise<Team> => {
        const teamRef = doc(collection(db, 'teams'));
        const userRef = doc(db, 'users', owner.id);

        const ownerAsMember: User = { ...owner };
        delete (ownerAsMember as Partial<User>).profileComplete;

        const newTeam: Team = {
            id: teamRef.id,
            name: teamName,
            ownerId: owner.id,
            members: [ownerAsMember],
            skills: owner.skills,
            interests: owner.interests,
        };

        const batch = writeBatch(db);
        batch.set(teamRef, newTeam);
        batch.update(userRef, {
            teamId: teamRef.id,
            isTeamOwner: true,
            teamStatus: 'In a team'
        });

        // Create a group chat for the new team
        const conversationRef = doc(db, 'conversations', `team_${teamRef.id}`);
        const participants: Record<string, ConversationParticipant> = {
            [owner.id]: { id: owner.id, name: owner.name, avatarInitial: owner.avatarInitial }
        };
        batch.set(conversationRef, {
            participantIds: [owner.id],
            participants,
            lastMessage: null,
            isGroupChat: true,
            groupName: teamName,
            teamId: teamRef.id,
        });

        await batch.commit();
        return newTeam;
    },

    getTeam: async (teamId: string): Promise<Team | null> => {
        const teamDocRef = doc(db, 'teams', teamId);
        const teamDocSnap = await getDoc(teamDocRef);
        if (teamDocSnap.exists()) {
            return { id: teamDocSnap.id, ...teamDocSnap.data() } as Team;
        }
        return null;
    },

    leaveTeam: async (user: User, teamId: string): Promise<void> => {
        const teamRef = doc(db, 'teams', teamId);
        const userRef = doc(db, 'users', user.id);
        const teamSnap = await getDoc(teamRef);
    
        if (!teamSnap.exists()) {
            // Team might have been deleted. Just update the user.
            await updateDoc(userRef, { teamId: null, isTeamOwner: false, teamStatus: 'Looking for a team' });
            return;
        }
        const team = teamSnap.data() as Team;
        
        const batch = writeBatch(db);
    
        if (user.id === team.ownerId) {
            if (team.members.length > 1) {
                throw new Error("You are the owner. Please transfer ownership or remove other members before leaving.");
            }
            // Owner is last member, delete team and its chat
            const conversationRef = doc(db, 'conversations', `team_${teamId}`);
            batch.delete(teamRef);
            batch.delete(conversationRef);
        } else {
            // Regular member, remove from team and its chat
            const updatedMembers = team.members.filter(m => m.id !== user.id);
            const updatedSkills = Array.from(new Set(updatedMembers.flatMap(m => m.skills)));
            const updatedInterests = Array.from(new Set(updatedMembers.flatMap(m => m.interests)));
            batch.update(teamRef, { 
                members: updatedMembers,
                skills: updatedSkills,
                interests: updatedInterests,
            });

            const conversationRef = doc(db, 'conversations', `team_${teamId}`);
            batch.update(conversationRef, { participantIds: arrayRemove(user.id) });
        }
    
        // Update user's profile
        batch.update(userRef, {
            teamId: null,
            isTeamOwner: false,
            teamStatus: 'Looking for a team',
        });
    
        await batch.commit();
    },
    
    listenForInvitations: (callback: (invitations: Invitation[]) => void): (() => void) => {
        const currentUserId = getCurrentUserId();
        const q = query(
            collection(db, 'invitations'),
            where('toUserId', '==', currentUserId),
            where('status', '==', 'pending')
        );

        return onSnapshot(q, (querySnapshot) => {
            const invitations = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Invitation));
            callback(invitations);
        });
    },

    sendInvitation: async (team: Team, fromUser: User, toUser: User): Promise<void> => {
        const invitationRef = collection(db, 'invitations');
        
        // Check if an invitation already exists
        const q = query(invitationRef, 
            where('teamId', '==', team.id), 
            where('toUserId', '==', toUser.id),
            where('status', '==', 'pending')
        );
        const existingInvites = await getDocs(q);
        if (!existingInvites.empty) {
            throw new Error("An invitation to this user for this team already exists.");
        }

        const newInvitation: Omit<Invitation, 'id'> = {
            teamId: team.id,
            teamName: team.name,
            fromUser: {
                id: fromUser.id,
                name: fromUser.name,
            },
            toUserId: toUser.id,
            status: 'pending',
            createdAt: Timestamp.now(),
        };
        await addDoc(invitationRef, newInvitation);
    },

    handleInvitation: async (invitationId: string, accepted: boolean, user: User): Promise<void> => {
        const invRef = doc(db, 'invitations', invitationId);
        const invSnap = await getDoc(invRef);
        if (!invSnap.exists()) throw new Error("Invitation not found.");
        
        const invitation = invSnap.data() as Omit<Invitation, 'id'>;
        const userRef = doc(db, 'users', user.id);
        const teamRef = doc(db, 'teams', invitation.teamId);

        const batch = writeBatch(db);

        if (accepted) {
             const teamSnap = await getDoc(teamRef);
             if (!teamSnap.exists()) throw new Error("Team not found.");
             const teamData = teamSnap.data() as Team;

             // Create a clean user object to add to the team members array
             const userForTeam = { ...user };
             delete userForTeam.profileComplete; // Clean up non-essential fields if needed

             const newSkills = Array.from(new Set([...teamData.skills, ...user.skills]));
             const newInterests = Array.from(new Set([...teamData.interests, ...user.interests]));
            
             batch.update(userRef, {
                teamId: invitation.teamId,
                teamStatus: 'In a team'
            });
            batch.update(teamRef, {
                members: arrayUnion(userForTeam),
                skills: newSkills,
                interests: newInterests,
            });

            // Add user to the team's group chat
            const conversationRef = doc(db, 'conversations', `team_${invitation.teamId}`);
            const newParticipant = { id: user.id, name: user.name, avatarInitial: user.avatarInitial };
            batch.update(conversationRef, {
                participantIds: arrayUnion(user.id),
                [`participants.${user.id}`]: newParticipant,
            });
        }
        
        batch.delete(invRef);
        
        await batch.commit();
    },
    
    // --- TEAM RECOMMENDATION ALGORITHM ---
    getRecommendedTeams: async (currentUser: User): Promise<Team[]> => {
        const teamsRef = collection(db, 'teams');
        const q = query(teamsRef, where('ownerId', '!=', currentUser.id));
        const querySnapshot = await getDocs(q);
        
        const allTeams = querySnapshot.docs.map(doc => doc.data() as Team)
            .filter(team => !team.members.some(member => member.id === currentUser.id)); // Filter out teams user is already in

        const userSkills = new Set(currentUser.skills);
        const userInterests = new Set(currentUser.interests);

        const scoredTeams = allTeams.map(team => {
            const teamSkills = new Set(team.skills);
            const teamInterests = new Set(team.interests);

            const commonSkills = [...userSkills].filter(skill => teamSkills.has(skill));
            const commonInterests = [...userInterests].filter(interest => teamInterests.has(interest));
            
            // Simple scoring: more weight to common skills
            const score = (commonSkills.length * 2) + commonInterests.length;

            return { ...team, score, commonSkills, commonInterests };
        });

        // Filter out teams with no commonalities and sort by score
        return scoredTeams
            .filter(team => team.score > 0)
            .sort((a, b) => b.score - a.score);
    },


    // --- REAL-TIME MESSAGING ---

    getConversations: (callback: (conversations: Conversation[]) => void): (() => void) => {
        const currentUserId = getCurrentUserId();
        const q = query(
            collection(db, 'conversations'),
            where('participantIds', 'array-contains', currentUserId)
        );

        return onSnapshot(q, (querySnapshot) => {
            const conversations = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Conversation));
            callback(conversations);
        }, (error) => {
            console.error("Error fetching conversations:", error);
            callback([]); // Return empty on error to prevent infinite loading
        });
    },

    getMessages: (conversationId: string, callback: (messages: Message[]) => void): (() => void) => {
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        return onSnapshot(q, (querySnapshot) => {
            const messages = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            callback(messages);
        });
    },

    findOrCreateConversation: async (currentUser: User, otherUser: User): Promise<string> => {
        const currentUserId = currentUser.id;
        const otherUserId = otherUser.id;
        const conversationId = [currentUserId, otherUserId].sort().join('_');
        const conversationRef = doc(db, 'conversations', conversationId);
        
        const docSnap = await getDoc(conversationRef);

        if (!docSnap.exists()) {
             const participants: Record<string, ConversationParticipant> = {
                [currentUserId]: { id: currentUserId, name: currentUser.name, avatarInitial: currentUser.avatarInitial },
                [otherUserId]: { id: otherUserId, name: otherUser.name, avatarInitial: otherUser.avatarInitial }
            };

            await setDoc(conversationRef, {
                participantIds: [currentUserId, otherUserId],
                participants,
                lastMessage: null,
            });
        }
        return conversationId;
    },

    sendMessage: async (conversationId: string, text: string): Promise<void> => {
        const currentUserId = getCurrentUserId();
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const conversationRef = doc(db, 'conversations', conversationId);

        const newMessage = {
            senderId: currentUserId,
            text,
            timestamp: Timestamp.now(),
        };

        await addDoc(messagesRef, newMessage);
        await updateDoc(conversationRef, {
            lastMessage: {
                text,
                timestamp: newMessage.timestamp,
                senderId: currentUserId,
            }
        });
    },
    
    deleteUserAccount: async (user: User): Promise<void> => {
        const userRef = doc(db, 'users', user.id);
        
        // This part needs to run before deleting the user document.
        // It can't be in a single batch because we need to read team data first.
        if (user.teamId) {
            const teamRef = doc(db, 'teams', user.teamId);
            const teamSnap = await getDoc(teamRef);

            if (teamSnap.exists()) {
                const team = teamSnap.data() as Team;
                if (user.isTeamOwner) {
                    if (team.members.length > 1) {
                        throw new Error("You are the owner of a team with other members. Please transfer ownership or remove all members before deleting your account.");
                    }
                    // If owner is the only member, delete the team and its chat.
                    const conversationRef = doc(db, 'conversations', `team_${user.teamId}`);
                    await deleteDoc(teamRef);
                    await deleteDoc(conversationRef);
                } else {
                    // User is a regular member, so remove them from the team and chat.
                    const updatedMembers = team.members.filter(m => m.id !== user.id);
                    const conversationRef = doc(db, 'conversations', `team_${user.teamId}`);
                    await updateDoc(teamRef, { members: updatedMembers });
                    await updateDoc(conversationRef, { participantIds: arrayRemove(user.id) });
                }
            }
        }
        
        // After handling team logic, delete the user document.
        await deleteDoc(userRef);
    },

    // --- DATABASE SEEDING ---
    seedDatabase: async (): Promise<void> => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(1));
        const snapshot = await getDocs(q);

        // Only seed if there are NO users in the database.
        if (snapshot.empty) {
            console.log("Database is empty. Seeding with mock users and a team...");
            const batch = writeBatch(db);
            const mockUsersWithIds = MOCK_USERS.map(user => ({
                ...user,
                id: `mock-${user.id}`, // Ensure mock users have unique IDs
                profileComplete: true,
            }));

            mockUsersWithIds.forEach(user => {
                const userDocRef = doc(db, 'users', user.id);
                batch.set(userDocRef, user);
            });
            
            // Create a mock team to ensure recommendation feature works from the start
            const teamOwner = mockUsersWithIds.find(u => u.id === 'mock-user-6');
            const teamMember = mockUsersWithIds.find(u => u.id === 'mock-user-2');
            
            if(teamOwner && teamMember) {
                const teamRef = doc(collection(db, 'teams'));
                const teamId = teamRef.id;

                const team: Team = {
                    id: teamId,
                    name: 'Team Innovate',
                    ownerId: teamOwner.id,
                    members: [teamOwner, teamMember],
                    skills: Array.from(new Set([...teamOwner.skills, ...teamMember.skills])),
                    interests: Array.from(new Set([...teamOwner.interests, ...teamMember.interests])),
                };
                batch.set(teamRef, team);

                // Update the team members' profiles
                const ownerRef = doc(db, 'users', teamOwner.id);
                batch.update(ownerRef, { teamId: teamId, teamStatus: 'In a team', isTeamOwner: true });
                
                const memberRef = doc(db, 'users', teamMember.id);
                batch.update(memberRef, { teamId: teamId, teamStatus: 'In a team', isTeamOwner: false });
            }

            await batch.commit();
            console.log("Database seeded successfully.");
        }
    }
};