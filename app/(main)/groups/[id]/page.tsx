'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      return { text: `+$${formatted}`, color: 'text-green-600', bg: 'bg-green-50' };
    } else if (amount < 0) {
      return { text: `-$${formatted}`, color: 'text-red-600', bg: 'bg-red-50' };
    }
    return { text: '$0.00', color: 'text-gray-600', bg: 'bg-gray-50' };
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
              <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                <span className="text-xs text-gray-600">+{group.members.length - 4}</span>
              </div>
            )}
          </div>
          <GroupSettingsModal group={group} onGroupUpdated={() => refetchGroup()} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="flex w-full">
          {/* <TabsTrigger value="activity">Activity</TabsTrigger> */}
          <TabsTrigger value="expenses" className="flex-1">Expenses</TabsTrigger>
          <TabsTrigger value="balances" className="flex-1">Balances</TabsTrigger>
          <TabsTrigger value="members" className="flex-1">Members</TabsTrigger>
        </TabsList>

        {/* <TabsContent value="activity" className="space-y-4">
          <div className="bg-white rounded-lg border min-h-[500px] flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto max-h-96">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwn={message.senderId === currentUserId}
                      onReply={setReplyingTo}
                      onReact={handleReaction}
                    />
                  ))}
                </div>
              )}
            </div>

            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50 border-t border-b">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Replying to </span>
                    <span className="font-medium">{replyingTo.senderName}</span>
                    <p className="text-muted-foreground truncate">{replyingTo.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            <div className="p-4 border-t">
              <div className="flex space-x-2 mb-3">
                <Button
                  onClick={() => setAiModalOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Expense
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setManualModalOpen(true)}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Manual
                </Button>
              </div>
              
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" type="button">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" type="button">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button type="submit" disabled={!messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </TabsContent> */}

        <TabsContent value="expenses" className="space-y-4">
          <ExpenseHistory groupId={group._id} onAddExpense={() => setManualModalOpen(true)} />
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
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
                              {balance.amount >= 0 ? 'Gets back' : 'Owes'}
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
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
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
                        <p className="text-sm text-muted-foreground">{member.email}</p>
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
        </TabsContent>
      </Tabs>

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