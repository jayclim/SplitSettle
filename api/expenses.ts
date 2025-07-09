import api from './api';

export interface Expense {
  _id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  splitBetween: {
    _id: string;
    name: string;
    amount: number;
  }[];
  category?: string;
  date: string;
  createdAt: string;
  receipt?: string;
  settled: boolean;
}

export interface CreateExpenseData {
  groupId: string;
  description: string;
  amount: number;
  paidById: string;
  splitBetween: string[];
  splitType: 'equal' | 'custom' | 'percentage';
  customSplits?: { userId: string; amount: number }[];
  category?: string;
  receipt?: string;
}

export interface AIExpenseData {
  groupId: string;
  description: string;
  voiceData?: Blob;
  imageData?: File;
}

// Description: Get expenses for a group
// Endpoint: GET /api/groups/:groupId/expenses
// Request: { groupId: string }
// Response: { expenses: Expense[] }
export const getExpenses = (groupId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        expenses: [
          {
            _id: '1',
            groupId,
            description: 'Grocery shopping at Whole Foods',
            amount: 85.50,
            paidBy: { _id: '1', name: 'John Doe', avatar: '' },
            splitBetween: [
              { _id: '1', name: 'John Doe', amount: 28.50 },
              { _id: '2', name: 'Jane Smith', amount: 28.50 },
              { _id: '3', name: 'Bob Wilson', amount: 28.50 }
            ],
            category: 'Food',
            date: '2024-01-15',
            createdAt: '2024-01-15T10:30:00Z',
            settled: false
          },
          {
            _id: '2',
            groupId,
            description: 'Uber ride to airport',
            amount: 45.00,
            paidBy: { _id: '2', name: 'Jane Smith', avatar: '' },
            splitBetween: [
              { _id: '1', name: 'John Doe', amount: 22.50 },
              { _id: '2', name: 'Jane Smith', amount: 22.50 }
            ],
            category: 'Transportation',
            date: '2024-01-14',
            createdAt: '2024-01-14T15:45:00Z',
            settled: true
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/groups/${groupId}/expenses`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a new expense
// Endpoint: POST /api/expenses
// Request: CreateExpenseData
// Response: { expense: Expense }
export const createExpense = (data: CreateExpenseData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        expense: {
          _id: Date.now().toString(),
          groupId: data.groupId,
          description: data.description,
          amount: data.amount,
          paidBy: { _id: data.paidById, name: 'Current User', avatar: '' },
          splitBetween: data.splitBetween.map(id => ({ _id: id, name: 'User', amount: data.amount / data.splitBetween.length })),
          category: data.category,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          settled: false
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/expenses', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Process AI expense input
// Endpoint: POST /api/expenses/ai
// Request: AIExpenseData
// Response: { parsedExpense: Partial<CreateExpenseData> }
export const processAIExpense = (data: AIExpenseData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        parsedExpense: {
          description: data.description || 'Lunch at restaurant',
          amount: 45.00,
          splitBetween: ['1', '2', '3'],
          category: 'Food',
          splitType: 'equal'
        }
      });
    }, 1500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const formData = new FormData();
  //   formData.append('groupId', data.groupId);
  //   formData.append('description', data.description);
  //   if (data.voiceData) formData.append('voice', data.voiceData);
  //   if (data.imageData) formData.append('image', data.imageData);
  //   return await api.post('/api/expenses/ai', formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' }
  //   });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};