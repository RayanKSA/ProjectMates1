
export type Page = 'Dashboard';

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
}

export interface Invitation {
  id: string;
  fromUser: {
    id: string;
    name: string;
  };
  teamName: string;
}

export interface Team {
  id: string;
  name: string;
  members: User[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatarInitial: string;
    isOnline: boolean;
  };
  lastMessage: {
    text: string;
    timestamp: string;
  };
  unreadCount: number;
}
