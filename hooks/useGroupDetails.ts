import { useQuery } from '@tanstack/react-query';
import { getGroup, getMessages, getBalances, getExpenses, GroupDetail, Message, Balance, Expense } from '@/lib/actions/groups';

export function useGroup(id: string) {
    return useQuery<{ group: GroupDetail }>({
        queryKey: ['group', id],
        queryFn: async () => {
            const response = await getGroup(id);
            return response as { group: GroupDetail };
        },
        enabled: !!id,
    });
}

export function useGroupMessages(id: string) {
    return useQuery<{ messages: Message[], hasMore: boolean }>({
        queryKey: ['group-messages', id],
        queryFn: async () => {
            const response = await getMessages(id);
            return response as { messages: Message[], hasMore: boolean };
        },
        enabled: !!id,
        refetchInterval: 5000, // Poll every 5 seconds for new messages
    });
}

export function useGroupBalances(id: string) {
    return useQuery<{ balances: Balance[] }>({
        queryKey: ['group-balances', id],
        queryFn: async () => {
            const response = await getBalances(id);
            return response as { balances: Balance[] };
        },
        enabled: !!id,
    });
}

export function useGroupExpenses(id: string) {
    return useQuery<{ expenses: Expense[] }>({
        queryKey: ['group-expenses', id],
        queryFn: async () => {
            const response = await getExpenses(id);
            return response as { expenses: Expense[] };
        },
        enabled: !!id,
    });
}
