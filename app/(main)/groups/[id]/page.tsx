'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from '@/components/MessageBubble';
import { AIExpenseModal } from '@/components/AIExpenseModal';
import { ManualExpenseModal } from '@/components/ManualExpenseModal';
import { GroupSettingsModal } from '@/components/GroupSettingsModal';
import { ExpenseHistory } from '@/components/ExpenseHistory';
import { ArrowLeft, Settings, Sparkles, Plus, Send, Smile, Paperclip } from 'lucide-react';
import { useGroup, useGroupMessages, useGroupBalances, useGroupExpenses } from '@/hooks/useGroupDetails';
import { sendMessage, addReaction, type GroupDetail as Group, type Message, type Balance } from '@/lib/actions/groups';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SettleUpModal } from '@/components/SettleUpModal';

interface MessageResponse {
  message: Message;
}

export default function GroupDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: groupData, isLoading: groupLoading, refetch: refetchGroup } = useGroup(id);
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useGroupMessages(id);
  const { data: balancesData, isLoading: balancesLoading, refetch: refetchBalances } = useGroupBalances(id);
  const { refetch: refetchExpenses } = useGroupExpenses(id);
  
  const group = groupData?.group || null;
  const messages = messagesData?.messages || [];
  const balances = balancesData?.balances || [];
  const loading = groupLoading; // Main loading state

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [settleUpModalOpen, setSettleUpModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("expenses");
  const { toast } = useToast();

  const getCurrentUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !id) return;

    try {
      console.log('Sending message:', messageText);
      const response = await sendMessage({
        groupId: id,
        content: messageText,
        replyToId: replyingTo?._id
      }) as MessageResponse;
      
      // setMessages(prev => [...prev, response.message]);
      refetchMessages(); // Refresh messages to ensure consistency
      setMessageText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      console.log('Adding reaction:', messageId, emoji);
      await addReaction(messageId, emoji);
      // In a real app, this would update via websocket
      toast({
        title: "Reaction added",
        description: `Added ${emoji} reaction`,
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add reaction",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatBalance = (amount: number) => {
    const abs = Math.abs(amount);
    const formatted = abs.toFixed(2);
    if (amount > 0) {
      return { text: `+$${formatted}`, color: 'text-green-600', bg: 'bg-green-50', label: 'Gets back' };
    } else if (amount < 0) {
      return { text: `-$${formatted}`, color: 'text-red-600', bg: 'bg-red-50', label: 'Owes' };
    }
    return { text: '$0.00', color: 'text-slate-600', bg: 'bg-slate-50', label: '' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-10" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Group not found</h2>
        <Button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground">
              {group.members.length} member{group.members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {group.members.slice(0, 4).map((member) => (
              <Avatar key={member._id} className="h-8 w-8 border-2 border-white">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-xs">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {group.members.length > 4 && (
              <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                <span className="text-xs text-slate-600">+{group.members.length - 4}</span>
              </div>
            )}
          </div>
          <GroupSettingsModal group={group} onGroupUpdated={() => refetchGroup()} />
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full space-y-4">
        <div className="flex w-full bg-muted p-1 rounded-md">
          {['expenses', 'balances', 'members'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                ${activeTab === tab ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted-foreground/10'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <ExpenseHistory groupId={group._id} onAddExpense={() => setManualModalOpen(true)} />
          </div>
        )}

        {activeTab === 'balances' && (
          <div className="space-y-4">
            {balancesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {balances.map((balance) => {
                  const balanceInfo = formatBalance(balance.amount);
                  return (
                    <Card key={balance._id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={balance.userAvatar} />
                              <AvatarFallback>
                                {getInitials(balance.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{balance.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                {balanceInfo.label}
                              </p>
                              {/* Show specific debt details */}
                              {balance.owesTo.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Owes: {balance.owesTo.map(debt => 
                                    `$${debt.amount.toFixed(2)} to ${debt.userName}`
                                  ).join(', ')}
                                </div>
                              )}
                              {balance.owedBy.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Owed: {balance.owedBy.map(debt => 
                                    `$${debt.amount.toFixed(2)} by ${debt.userName}`
                                  ).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className={`${balanceInfo.bg} ${balanceInfo.color} border-0`}>
                              {balanceInfo.text}
                            </Badge>
                            {/* Show settle up button if current user owes money to this person */}
                            {(() => {
                              // Find the current user's balance to check who they owe money to
                              const currentUserBalance = balances.find(b => b.userId === currentUserId);
                              const owesThisPerson = currentUserBalance?.owesTo.some(debt => debt.userId === balance.userId);
                              
                                return owesThisPerson && (
                                  // <Button 
                                  //   size="sm" 
                                  //   className="mt-2 ml-2"
                                  //   onClick={() => {
                                  //     setSelectedBalance(balance);
                                  //     setSettleUpModalOpen(true);
                                  //   }}
                                  // >
                                  //   Settle Up
                                  // </Button>
                                  null
                                );
                            })()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="space-y-4">
              {group.members.map((member) => (
                <Card key={member._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          {member.isGhost ? (
                            <p className="text-sm text-muted-foreground italic">Ghost User</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Modals */}
      <AIExpenseModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        groupId={group._id}
        members={group.members}
        onExpenseCreated={() => {
          refetchMessages();
          refetchBalances();
        }}
      />

      <ManualExpenseModal
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        groupId={group._id}
        members={group.members}
        currentUserId={currentUserId}
        onExpenseCreated={() => {
          refetchMessages();
          refetchBalances();
          refetchExpenses();
        }}
      />{selectedBalance && (
        <SettleUpModal
          open={settleUpModalOpen}
          onClose={() => {
            setSettleUpModalOpen(false);
            setSelectedBalance(null);
          }}
          balance={{
            userId: selectedBalance.userId,
            userName: selectedBalance.userName,
            userAvatar: selectedBalance.userAvatar,
            amount: selectedBalance.amount
          }}
          groupId={group._id}
          onSettlementCreated={() => {
            refetchBalances();
            refetchMessages();
            refetchExpenses();
          }}
        />
      )}
    </div>
  );
}