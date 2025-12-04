import { useQuery } from '@tanstack/react-query';
import { getGroup, getMessages, getBalances, getExpenses, GroupDetail, Message, Balance, Expense } from '@/lib/actions/groups';
import { useAuth } from '@clerk/nextjs';

export function useGroup(id: string) {
    const { isLoaded, userId } = useAuth();
    return useQuery<{ group: GroupDetail }>({
        queryKey: ['group', id],
        queryFn: async () => {
            const response = await getGroup(id);
            return response as { group: GroupDetail };
        },
        enabled: !!id && isLoaded && !!userId,
    });
}

export function useGroupMessages(id: string) {
    const { isLoaded, userId } = useAuth();
    return useQuery<{ messages: Message[], hasMore: boolean }>({
        queryKey: ['group-messages', id],
        queryFn: async () => {
            const response = await getMessages(id);
            return response as { messages: Message[], hasMore: boolean };
        },
        enabled: !!id && isLoaded && !!userId,
        refetchInterval: 5000, // Poll every 5 seconds for new messages
    });
}

export function useGroupBalances(id: string) {
    const { isLoaded, userId } = useAuth();
    return useQuery<{ balances: Balance[] }>({
        queryKey: ['group-balances', id],
        queryFn: async () => {
            const response = await getBalances(id);
            return response as { balances: Balance[] };
        },
        enabled: !!id && isLoaded && !!userId,
    });
}

export function useGroupExpenses(id: string) {
    const { isLoaded, userId } = useAuth();
    return useQuery<{ expenses: Expense[] }>({
        queryKey: ['group-expenses', id],
        queryFn: async () => {
            const response = await getExpenses(id);
            return response as { expenses: Expense[] };
        },
        enabled: !!id && isLoaded && !!userId,
    });
}
