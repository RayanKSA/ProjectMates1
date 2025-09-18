
import type { User, Invitation, Conversation, Message } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Nasser',
    avatarInitial: 'N',
    title: 'Computer Science Student',
    year: 4,
    about: "Enthusiastic Computer Science student passionate about Artificial Intelligence and building innovative solutions. Seeking motivated teammates for a challenging graduation project. Prefers working in the mornings and values clear communication. Looking for team members skilled in backend development or UI/UX design to complement my AI focus.",
    email: 'nasser.email@university.edu',
    department: 'College of Computer Science and Engineering',
    interests: ['Artificial Intelligence', 'Machine Learning', 'Data Science', 'Software Engineering'],
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Git', 'SQL', 'Docker'],
    workingPreferences: [
      'Prefers morning work sessions',
      'Values structured planning and regular check-ins',
      'Enjoys brainstorming sessions',
      'Seeking roles related to: AI/ML Development, Research'
    ],
    teamStatus: 'Looking for a team',
  },
  {
    id: 'user-2',
    name: 'Mohammed Al-Harbi',
    avatarInitial: 'MA',
    title: 'Computer Science - Year 4',
    year: 4,
    about: 'AI and Machine Learning enthusiast with hands-on experience in TensorFlow. Eager to collaborate on a project that pushes the boundaries of ML.',
    email: 'mohammed.h@university.edu',
    department: 'College of Computer Science and Engineering',
    interests: ['AI', 'Machine Learning'],
    skills: ['Python', 'TensorFlow', 'Keras'],
    workingPreferences: ['Prefers morning work sessions'],
    teamStatus: 'Looking for a team',
  },
  {
    id: 'user-3',
    name: 'Naif Al-Otaibi',
    avatarInitial: 'NA',
    title: 'Cybersecurity - Year 4',
    year: 4,
    about: 'Cybersecurity specialist focusing on network security and ethical hacking. Looking for a project in the security domain.',
    email: 'naif.o@university.edu',
    department: 'College of Computer Science and Engineering',
    interests: ['Cybersecurity', 'Networking'],
    skills: ['Java', 'Wireshark', 'Metasploit'],
    workingPreferences: ['Prefers afternoon sessions'],
    teamStatus: 'Looking for a team',
  },
  {
    id: 'user-4',
    name: 'Osama Almohammadi',
    avatarInitial: 'OA',
    title: 'Software Engineering - Year 3',
    year: 3,
    about: 'Frontend developer with a passion for creating beautiful and intuitive user interfaces. Proficient in React and Figma.',
    email: 'osama.a@university.edu',
    department: 'College of Computer Science and Engineering',
    interests: ['Web Development', 'UI/UX'],
    skills: ['React', 'Figma', 'CSS', 'JavaScript'],
    workingPreferences: ['Flexible working hours'],
    teamStatus: 'Looking for a team',
  },
  {
    id: 'user-5',
    name: 'Rayan Al-Saedi',
    avatarInitial: 'RA',
    title: 'Computer Science - Year 4',
    year: 4,
    about: 'Data analyst with experience in Python, Pandas, and SQL. Interested in a data-intensive project.',
    email: 'rayan.s@university.edu',
    department: 'College of Computer Science and Engineering',
    interests: ['AI', 'Data Analysis'],
    skills: ['Python', 'Pandas', 'SQL'],
    workingPreferences: ['Loves remote collaboration'],
    teamStatus: 'Looking for a team',
  },
  {
    id: 'user-6',
    name: 'Khalid Ibrahim',
    avatarInitial: 'KI',
    title: 'Information Systems - Year 4',
    year: 4,
    about: 'Project manager with a knack for organization and agile methodologies. Ready to lead a team to success.',
    email: 'khalid.i@university.edu',
    department: 'Information Systems',
    interests: ['Project Management', 'Data Analysis'],
    skills: ['SQL', 'Jira', 'Agile'],
    workingPreferences: ['Enjoys structured meetings'],
    teamStatus: 'In a team',
  },
  {
    id: 'user-7',
    name: 'Ahmed Saleh',
    avatarInitial: 'AS',
    title: 'Computer Engineering - Year 3',
    year: 3,
    about: 'Embedded systems programmer with experience in C++ and IoT devices. Looking for a hardware-related project.',
    email: 'ahmed.s@university.edu',
    department: 'Computer Engineering',
    interests: ['Embedded Systems', 'IoT'],
    skills: ['C++', 'Python', 'Arduino'],
    workingPreferences: ['Hands-on lab work preferred'],
    teamStatus: 'Looking for a team',
  },
];


export const MOCK_INVITATIONS: Invitation[] = [
    {
        id: 'inv-1',
        fromUser: {
            id: 'user-6',
            name: 'Khalid Ibrahim'
        },
        teamName: 'Team Innovate'
    }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participant: { id: 'user-2', name: 'Mohammed Al-Harbi', avatarInitial: 'MA', isOnline: true },
    lastMessage: { text: "Okay, sounds good! Let's discuss tomorrow.", timestamp: '10:30 AM' },
    unreadCount: 0,
  },
  {
    id: 'conv-2',
    participant: { id: 'user-3', name: 'Naif Al-Otaibi', avatarInitial: 'NA', isOnline: false },
    lastMessage: { text: 'Did you see the project requirements?', timestamp: 'Yesterday' },
    unreadCount: 1,
  },
  {
    id: 'conv-3',
    participant: { id: 'team-1', name: 'Team Innovate', avatarInitial: 'TI', isOnline: false },
    lastMessage: { text: 'Khalid: Meeting at 2 PM.', timestamp: 'Mon' },
    unreadCount: 0,
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    { id: 'msg-1', senderId: 'user-2', text: 'Hey Nasser! I saw your profile, looks like we have similar interests in AI. Are you still looking for teammates?', timestamp: '10:25 AM' },
    { id: 'msg-2', senderId: 'user-1', text: 'Hi Mohammed! Yes, definitely. Your skills in TensorFlow look great. What kind of project idea did you have in mind?', timestamp: '10:28 AM' },
    { id: 'msg-3', senderId: 'user-2', text: 'I was thinking about something related to natural language processing, maybe analyzing sentiment in academic papers? Or perhaps computer vision for medical image analysis.', timestamp: '10:29 AM' },
    { id: 'msg-4', senderId: 'user-2', text: "Okay, sounds good! Let's discuss the AI model tomorrow.", timestamp: '10:30 AM' },
  ],
  'conv-2': [
    { id: 'msg-5', senderId: 'user-3', text: 'Did you see the project requirements?', timestamp: 'Yesterday' },
  ]
};
