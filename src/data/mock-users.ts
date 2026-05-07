import type { User } from '@/types';

export const MOCK_USERS: User[] = [
  { id: 'u-001', name: 'Eleanor Whitfield', email: 'eleanor.whitfield@lb.local', role: 'Admin', initials: 'EW', avatarColour: '#3B82F6' },
  { id: 'u-002', name: 'Jon H.', email: 'jon.h@lb.local', role: 'Senior Consultant', initials: 'JH', avatarColour: '#06B6D4' },
  { id: 'u-003', name: 'Priya Bhatt', email: 'priya.bhatt@lb.local', role: 'Lead Assessor', initials: 'PB', avatarColour: '#10B981' },
  { id: 'u-004', name: 'Daniel Carrington', email: 'daniel.carrington@lb.local', role: 'Assessor', initials: 'DC', avatarColour: '#F59E0B' },
  { id: 'u-005', name: 'Aisha Rahman', email: 'aisha.rahman@lb.local', role: 'Assessor', initials: 'AR', avatarColour: '#8B5CF6' },
  { id: 'u-006', name: 'Tomás Lindqvist', email: 'tomas.lindqvist@lb.local', role: 'Reviewer', initials: 'TL', avatarColour: '#EC4899' },
];

// Default current user — Jon H., the Senior Consultant
export const CURRENT_USER = MOCK_USERS[1];
