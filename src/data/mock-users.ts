import type { User } from '@/types';

export const MOCK_USERS: User[] = [
  { id: 'u-001', name: 'Jon H.',    email: 'jon.h@lb.local',     role: 'Senior Consultant',  initials: 'JH', avatarColour: '#06B6D4' },
  { id: 'u-002', name: 'Anna S.',   email: 'anna.s@lb.local',    role: 'Consultant',         initials: 'AS', avatarColour: '#3B82F6' },
  { id: 'u-003', name: 'Daniel E.', email: 'daniel.e@lb.local',  role: 'Associate',          initials: 'DE', avatarColour: '#F59E0B' },
  { id: 'u-004', name: 'James R.',  email: 'james.r@lb.local',   role: 'Engagement Manager', initials: 'JR', avatarColour: '#8B5CF6' },
];

// Default current user — Jon H., the Senior Consultant
export const CURRENT_USER = MOCK_USERS[0];

export function canLead(role: User['role']) {
  return role === 'Senior Consultant' || role === 'Engagement Manager';
}

export function canQA(role: User['role']) {
  return role === 'Engagement Manager';
}
