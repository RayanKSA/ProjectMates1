import { Timestamp } from 'firebase/firestore';

export type Page = 'Dashboard' | 'Find Teammates' | 'My Profile' | 'Messages' | 'UserProfile';

export interface User {
  id: string;
  name: string;
  avatarInitial: string;
  title: string;
  year: number;
  about: string;
  email: string;
  department: string;
  interests: string[];
  skills: string[];
  workingPreferences: string[];
  teamStatus: 'Looking for a team' | 'In a team';
  profileComplete?: boolean;
  teamId?: string | null;
  isTeamOwner?: boolean;
}

export interface Invitation {
  id: string;
  teamId: string;
  teamName: string;
  fromUser: {
    id: string;
    name: string;
  };
  toUserId: string;
  status: 'pending'; // could be expanded to 'accepted', 'declined'
  createdAt: Timestamp;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: User[];
  skills: string[];
  interests: string[];
}


export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatarInitial: string;
}

export interface Conversation {
  id: string;
  participants: Record<string, ConversationParticipant>; // Maps userId to participant details
  participantIds: string[];
  lastMessage: {
    text: string;
    timestamp: Timestamp;
    senderId: string;
  } | null;
  isGroupChat?: boolean;
  groupName?: string;
  teamId?: string;
}