// import api from './api';

export interface Balance {
  _id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  amount: number;
  owesTo: {
    userId: string;
    userName: string;
    amount: number;
  }[];
  owedBy: {
    userId: string;
    userName: string;
    amount: number;
  }[];
}

export interface Settlement {
  _id: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  method: 'venmo' | 'paypal' | 'cash' | 'bank' | 'other';
  status: 'pending' | 'confirmed' | 'disputed';
  createdAt: string;
  confirmedAt?: string;
  notes?: string;
}

export interface CreateSettlementData {
  groupId: string;
  toUserId: string;
  amount: number;
  method: string;
  notes?: string;
}

// Description: Get balances for a group
// Endpoint: GET /api/groups/:groupId/balances
// Request: { groupId: string }
// Response: { balances: Balance[], netBalance: number }
export const getBalances = (groupId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        balances: [
          {
            _id: '1',
            groupId,
            userId: '1',
            userName: 'John Doe',
            userAvatar: '',
            amount: -25.50,
            owesTo: [
              { userId: '2', userName: 'Jane Smith', amount: 15.25 },
              { userId: '3', userName: 'Bob Wilson', amount: 10.25 }
            ],
            owedBy: []
          },
          {
            _id: '2',
            groupId,
            userId: '2',
            userName: 'Jane Smith',
            userAvatar: '',
            amount: 15.25,
            owesTo: [],
            owedBy: [
              { userId: '1', userName: 'John Doe', amount: 15.25 }
            ]
          },
          {
            _id: '3',
            groupId,
            userId: '3',
            userName: 'Bob Wilson',
            userAvatar: '',
            amount: 10.25,
            owesTo: [],
            owedBy: [
              { userId: '1', userName: 'John Doe', amount: 10.25 }
            ]
          }
        ],
        netBalance: -25.50
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/groups/${groupId}/balances`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a settlement
// Endpoint: POST /api/settlements
// Request: CreateSettlementData
// Response: { settlement: Settlement }
export const createSettlement = (data: CreateSettlementData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        settlement: {
          _id: Date.now().toString(),
          groupId: data.groupId,
          fromUserId: '1',
          fromUserName: 'Current User',
          toUserId: data.toUserId,
          toUserName: 'Other User',
          amount: data.amount,
          method: data.method,
          status: 'pending',
          createdAt: new Date().toISOString(),
          notes: data.notes
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/settlements', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Confirm a settlement
// Endpoint: PUT /api/settlements/:id/confirm
// Request: { settlementId: string }
// Response: { success: boolean }
export const confirmSettlement = (settlementId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/settlements/${settlementId}/confirm`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};