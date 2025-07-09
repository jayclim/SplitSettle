import api from './api';

export interface Group {
  _id: string;
  name: string;
  description?: string;
  coverImage?: string;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  recentActivity?: string;
  balance: number;
}

export interface GroupMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  coverImage?: string;
}

export interface InviteData {
  groupId: string;
  emails?: string[];
  shareableLink?: boolean;
  qrCode?: boolean;
}

// Description: Get all groups for the current user
// Endpoint: GET /api/groups
// Request: {}
// Response: { groups: Group[] }
export const getGroups = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        groups: [
          {
            _id: '1',
            name: 'Roommates',
            description: 'Shared apartment expenses',
            members: [
              { _id: '1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'admin', joinedAt: '2024-01-01' },
              { _id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: '', role: 'member', joinedAt: '2024-01-02' },
              { _id: '3', name: 'Bob Wilson', email: 'bob@example.com', avatar: '', role: 'member', joinedAt: '2024-01-03' }
            ],
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15',
            unreadCount: 3,
            recentActivity: 'Sarah added lunch - 2 hours ago',
            balance: -25.50
          },
          {
            _id: '2',
            name: 'Weekend Trip',
            description: 'Cabin trip expenses',
            members: [
              { _id: '1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'admin', joinedAt: '2024-01-01' },
              { _id: '4', name: 'Alice Brown', email: 'alice@example.com', avatar: '', role: 'member', joinedAt: '2024-01-05' }
            ],
            createdAt: '2024-01-05',
            updatedAt: '2024-01-10',
            unreadCount: 0,
            recentActivity: 'Trip completed',
            balance: 45.25
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/groups');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a new group
// Endpoint: POST /api/groups
// Request: CreateGroupData
// Response: { group: Group }
export const createGroup = (data: CreateGroupData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        group: {
          _id: Date.now().toString(),
          name: data.name,
          description: data.description,
          coverImage: data.coverImage,
          members: [
            { _id: '1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'admin', joinedAt: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unreadCount: 0,
          balance: 0
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/groups', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get group by ID
// Endpoint: GET /api/groups/:id
// Request: { id: string }
// Response: { group: Group }
export const getGroup = (id: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        group: {
          _id: id,
          name: 'Roommates',
          description: 'Shared apartment expenses',
          members: [
            { _id: '1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'admin', joinedAt: '2024-01-01' },
            { _id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: '', role: 'member', joinedAt: '2024-01-02' },
            { _id: '3', name: 'Bob Wilson', email: 'bob@example.com', avatar: '', role: 'member', joinedAt: '2024-01-03' }
          ],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-15',
          unreadCount: 0,
          balance: -25.50
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/groups/${id}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Join a group by code or link
// Endpoint: POST /api/groups/join
// Request: { code?: string, link?: string }
// Response: { group: Group }
export const joinGroup = (data: { code?: string; link?: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        group: {
          _id: '3',
          name: 'New Group',
          description: 'Joined via code/link',
          members: [
            { _id: '1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'member', joinedAt: new Date().toISOString() }
          ],
          createdAt: '2024-01-01',
          updatedAt: new Date().toISOString(),
          unreadCount: 0,
          balance: 0
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/groups/join', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};