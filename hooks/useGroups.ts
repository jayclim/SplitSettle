import { useQuery } from '@tanstack/react-query';
import { getGroupsForUser, GroupCardData } from '@/lib/actions/groups';

export function useGroups() {
    return useQuery<GroupCardData[]>({
        queryKey: ['groups'],
        queryFn: async () => {
            return await getGroupsForUser();
        },
    });
}
