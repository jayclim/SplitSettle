import api from './api';

export interface Message {
  _id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'expense' | 'settlement' | 'image';
  timestamp: string;
  replyTo?: {
    _id: string;
    content: string;
    senderName: string;
  };
  reactions: {
    emoji: string;
    users: string[];
  }[];
  expenseId?: string;
  imageUrl?: string;
}

export interface SendMessageData {
  groupId: string;
  content: string;
  type?: 'text' | 'image';
  replyToId?: string;
  imageFile?: File;
}

// Description: Get messages for a group
// Endpoint: GET /api/groups/:groupId/messages
// Request: { groupId: string, page?: number, limit?: number }
// Response: { messages: Message[], hasMore: boolean }
export const getMessages = (groupId: string, page = 1, limit = 50) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        messages: [
          {
            _id: '1',
            groupId,
            senderId: '1',
            senderName: 'John Doe',
            senderAvatar: '',
            content: 'Hey everyone! Just added the grocery expense from yesterday.',
            type: 'text',
            timestamp: '2024-01-15T10:30:00Z',
            reactions: [
              { emoji: '👍', users: ['2', '3'] }
            ]
          },
          {
            _id: '2',
            groupId,
            senderId: '2',
            senderName: 'Jane Smith',
            senderAvatar: '',
            content: 'Thanks for covering that!',
            type: 'text',
            timestamp: '2024-01-15T10:32:00Z',
            replyTo: {
              _id: '1',
              content: 'Hey everyone! Just added the grocery expense from yesterday.',
              senderName: 'John Doe'
            },
            reactions: []
          },
          {
            _id: '3',
            groupId,
            senderId: '1',
            senderName: 'John Doe',
            senderAvatar: '',
            content: 'Grocery shopping at Whole Foods - $85.50',
            type: 'expense',
            timestamp: '2024-01-15T10:30:00Z',
            expenseId: '1',
            reactions: []
          }
        ],
        hasMore: false
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/groups/${groupId}/messages?page=${page}&limit=${limit}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Send a message
// Endpoint: POST /api/messages
// Request: SendMessageData
// Response: { message: Message }
export const sendMessage = (data: SendMessageData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: {
          _id: Date.now().toString(),
          groupId: data.groupId,
          senderId: '1',
          senderName: 'Current User',
          senderAvatar: '',
          content: data.content,
          type: data.type || 'text',
          timestamp: new Date().toISOString(),
          reactions: []
        }
      });
    }, 300);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const formData = new FormData();
  //   formData.append('groupId', data.groupId);
  //   formData.append('content', data.content);
  //   if (data.type) formData.append('type', data.type);
  //   if (data.replyToId) formData.append('replyToId', data.replyToId);
  //   if (data.imageFile) formData.append('image', data.imageFile);
  //   return await api.post('/api/messages', formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' }
  //   });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Add reaction to message
// Endpoint: POST /api/messages/:messageId/react
// Request: { emoji: string }
// Response: { success: boolean }
export const addReaction = (messageId: string, emoji: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 200);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post(`/api/messages/${messageId}/react`, { emoji });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};