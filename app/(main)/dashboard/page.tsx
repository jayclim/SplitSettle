// filepath: app/(main)/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GroupCard } from '@/components/GroupCard';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { JoinGroupModal } from '@/components/JoinGroupModal';
import { Users, TrendingUp, DollarSign, Sparkles } from 'lucide-react';
import { getGroupsForUser, GroupCardData } from '@/lib/actions/groups';
import { useToast } from '@/hooks/useToast';

export default function Dashboard() {
  const [groups, setGroups] = useState<GroupCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      const userGroups = await getGroupsForUser();
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Calculate stats
  const totalBalance = groups.reduce((sum, group) => sum + (group.balance || 0), 0);
  const totalGroups = groups.length;
  const totalMembers = groups.reduce((sum, group) => sum + group.members.length, 0);

  const formatBalance = (amount: number) => {
    const abs = Math.abs(amount);
    const formatted = abs.toFixed(2);
    if (amount > 0) {
      return { text: `+$${formatted}`, color: 'text-green-600' };
    } else if (amount < 0) {
      return { text: `-$${formatted}`, color: 'text-red-600' };
    }
    return { text: '$0.00', color: 'text-muted-foreground' };
  };

  const balance = formatBalance(totalBalance);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Welcome to SplitSettle!</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Ready to make splitting expenses effortless? Create your first group or join an existing one to get started.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <CreateGroupModal onGroupCreated={loadGroups} />
          <JoinGroupModal onGroupJoined={loadGroups} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Groups</h1>
          <p className="text-muted-foreground">
            Manage your shared expenses across {totalGroups} group{totalGroups !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex space-x-3">
          <JoinGroupModal onGroupJoined={loadGroups} />
          <CreateGroupModal onGroupCreated={loadGroups} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance.color}`}>
              {balance.text}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalBalance > 0 ? "You are owed money" : totalBalance < 0 ? "You owe money" : "You're all settled up"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {groups.filter(g => g.unreadCount > 0).length} with new activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across all your groups
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import { GroupCard } from '@/components/GroupCard';
// import { CreateGroupModal } from '@/components/CreateGroupModal';
// import { JoinGroupModal } from '@/components/JoinGroupModal';
// import { Plus, Users, TrendingUp, DollarSign, Sparkles } from 'lucide-react';
// import { getGroups, Group } from '@/api/groups';
// import { useToast } from '@/hooks/useToast';

// interface GroupsResponse {
//   groups: Group[];
// }

// export default function Dashboard() {
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { toast } = useToast();

//   const loadGroups = async () => {
//     try {
//       setLoading(true);
//       console.log('Loading groups...');
//       const response = await getGroups() as GroupsResponse;
//       setGroups(response.groups);
//     } catch (error) {
//       console.error('Error loading groups:', error);
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to load groups",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadGroups();
//   }, []);

//   const totalBalance = groups.reduce((sum, group) => sum + group.balance, 0);
//   const totalGroups = groups.length;
//   const totalMembers = groups.reduce((sum, group) => sum + group.members.length, 0);

//   const formatBalance = (amount: number) => {
//     const abs = Math.abs(amount);
//     const formatted = abs.toFixed(2);
//     if (amount > 0) {
//       return { text: `+$${formatted}`, color: 'text-green-600' };
//     } else if (amount < 0) {
//       return { text: `-$${formatted}`, color: 'text-red-600' };
//     }
//     return { text: '$0.00', color: 'text-gray-600' };
//   };

//   const balance = formatBalance(totalBalance);

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <Skeleton className="h-8 w-48 mb-2" />
//             <Skeleton className="h-4 w-64" />
//           </div>
//           <div className="flex space-x-3">
//             <Skeleton className="h-10 w-24" />
//             <Skeleton className="h-10 w-32" />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {[1, 2, 3].map((i) => (
//             <Skeleton key={i} className="h-24" />
//           ))}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[1, 2, 3, 4, 5, 6].map((i) => (
//             <Skeleton key={i} className="h-48" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (groups.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
//           <Sparkles className="h-12 w-12 text-white" />
//         </div>
//         <h2 className="text-2xl font-bold mb-4">Welcome to SplitSettle!</h2>
//         <p className="text-muted-foreground mb-8 max-w-md mx-auto">
//           Ready to make splitting expenses effortless? Create your first group or join an existing one to get started.
//         </p>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
//           <Card className="text-center p-4">
//             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
//               <Users className="h-6 w-6 text-blue-600" />
//             </div>
//             <h3 className="font-semibold mb-2">Create a Group</h3>
//             <p className="text-sm text-muted-foreground">Start with roommates, friends, or travel companions</p>
//           </Card>
          
//           <Card className="text-center p-4">
//             <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
//               <Sparkles className="h-6 w-6 text-purple-600" />
//             </div>
//             <h3 className="font-semibold mb-2">Add Expenses with AI</h3>
//             <p className="text-sm text-muted-foreground">Just describe your expense in plain English</p>
//           </Card>
          
//           <Card className="text-center p-4">
//             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
//               <DollarSign className="h-6 w-6 text-green-600" />
//             </div>
//             <h3 className="font-semibold mb-2">Settle Up Easily</h3>
//             <p className="text-sm text-muted-foreground">One-tap settlements with payment integration</p>
//           </Card>
//         </div>

//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <CreateGroupModal onGroupCreated={loadGroups} />
//           <JoinGroupModal onGroupJoined={loadGroups} />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold">Your Groups</h1>
//           <p className="text-muted-foreground">
//             Manage your shared expenses across {totalGroups} group{totalGroups !== 1 ? 's' : ''}
//           </p>
//         </div>
//         <div className="flex space-x-3">
//           <JoinGroupModal onGroupJoined={loadGroups} />
//           <CreateGroupModal onGroupCreated={loadGroups} />
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className={`text-2xl font-bold ${balance.color}`}>
//               {balance.text}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {totalBalance >= 0 ? "You're owed money" : "You owe money"}
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{totalGroups}</div>
//             <p className="text-xs text-muted-foreground">
//               {groups.filter(g => g.unreadCount > 0).length} with new activity
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Members</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{totalMembers}</div>
//             <p className="text-xs text-muted-foreground">
//               Across all your groups
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Groups Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {groups.map((group) => (
//           <GroupCard key={group._id} group={group} />
//         ))}
//       </div>
//     </div>
//   );
// }