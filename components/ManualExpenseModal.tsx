import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Calculator } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createExpenseAction, CreateExpenseData } from '@/lib/actions/mutations';
import { GroupMember } from '@/api/groups';
import { useToast } from '@/hooks/useToast';

interface ManualExpenseModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  members: GroupMember[];
  onExpenseCreated: () => void;
  currentUserId: string | null;
}

export function ManualExpenseModal({ open, onClose, groupId, members, onExpenseCreated, currentUserId }: ManualExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateExpenseData>({
    defaultValues: {
      splitType: 'equal',
      paidById: currentUserId || undefined,
    }
  });

  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const splitType = watch('splitType');
  const selectedMembers = watch('splitBetween') || [];
  
  // Calculate total amount based on split type
  const formAmount = watch('amount');
  const totalAmount = splitType === 'equal' 
    ? (parseFloat(formAmount?.toString() || '0') || 0)
    : Object.values(customAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

  // Reset custom amounts when total amount changes or members change, if in equal mode
  useEffect(() => {
    if (splitType === 'equal' && totalAmount > 0 && selectedMembers.length > 0) {
      const splitAmount = (totalAmount / selectedMembers.length).toFixed(2);
      const newCustomAmounts: Record<string, string> = {};
      selectedMembers.forEach(id => {
        newCustomAmounts[id] = splitAmount;
      });
      setCustomAmounts(newCustomAmounts);
    }
  }, [totalAmount, selectedMembers, splitType]);

  const handleCustomAmountChange = (memberId: string, value: string) => {
    setCustomAmounts(prev => ({
      ...prev,
      [memberId]: value
    }));
  };

  // Update default paidById and splitBetween when modal opens
  useEffect(() => {
    if (open) {
      if (currentUserId) {
        setValue('paidById', currentUserId);
      }
      // Select all members by default
      if (members.length > 0) {
        setValue('splitBetween', members.map(m => m._id));
      }
    }
  }, [open, currentUserId, members, setValue]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const onSubmit = async (data: CreateExpenseData) => {
    try {
      setLoading(true);
      
      if (!data.paidById) {
        toast({
          title: "Error",
          description: "Please select who paid for this expense",
          variant: "destructive",
        });
        return;
      }

      if (!data.splitBetween || data.splitBetween.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one person to split with",
          variant: "destructive",
        });
        return;
      }

      let finalCustomSplits: { userId: string; amount: number }[] | undefined;
      let finalAmount = data.amount;

      if (data.splitType === 'custom') {
        const currentTotal = Object.values(customAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        finalAmount = currentTotal;
        
        if (currentTotal <= 0) {
           toast({
            title: "Error",
            description: "Total amount must be greater than 0",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        finalCustomSplits = Object.entries(customAmounts)
          .filter(([userId]) => data.splitBetween.includes(userId))
          .map(([userId, amount]) => ({
            userId,
            amount: parseFloat(amount) || 0
          }));
      }

      console.log('Creating manual expense:', { ...data, amount: finalAmount });
      await createExpenseAction({
        ...data,
        amount: finalAmount,
        groupId,
        splitType: data.splitType || 'equal',
        customSplits: finalCustomSplits
      });
      toast({
        title: "Expense added!",
        description: "Your expense has been added to the group.",
      });
      handleClose();
      onExpenseCreated();
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create expense",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    setCustomAmounts({});
  };

  const handleSelectAll = () => {
    const allMemberIds = members.map(m => m._id);
    setValue('splitBetween', allMemberIds);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <span>Add Expense Manually</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs 
            defaultValue="equal" 
            value={watch('splitType')} 
            onValueChange={(val) => setValue('splitType', val as 'equal' | 'custom')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="equal">Split Equally</TabsTrigger>
              <TabsTrigger value="custom">Split Unequally</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  placeholder="What was this expense for?"
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {splitType === 'equal' && (
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      {...register('amount', { required: 'Amount is required', min: 0.01 })}
                      placeholder="Enter total amount"
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>
                )}
                {splitType === 'custom' && (
                  <div className="space-y-2">
                    <Label>Total Amount</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-slate-100 px-3 py-2 text-sm text-muted-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50">
                      ${totalAmount.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Calculated from individual splits below</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paidBy">Paid by</Label>
                <Select 
                  onValueChange={(value) => setValue('paidById', value)} 
                  defaultValue={currentUserId || members[0]?._id}
                  value={watch('paidById')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select who paid" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member._id} value={member._id}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Split between</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSelectAll}
                    className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
                  >
                    Select All
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {members.map((member) => (
                    <label key={member._id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded">
                      <input
                        type="checkbox"
                        {...register('splitBetween')}
                        value={member._id}
                        className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Split Details */}
              {selectedMembers.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {splitType === 'equal' ? 'Split Summary' : 'Enter Amounts'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {splitType === 'equal' ? (
                      <div className="space-y-2">
                        {selectedMembers.map((memberId) => {
                          const member = members.find(m => m._id === memberId);
                          const amount = totalAmount / selectedMembers.length;
                          return (
                            <div key={memberId} className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={member?.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {member ? getInitials(member.name) : '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{member?.name}</span>
                              </div>
                              <Badge variant="secondary">${amount.toFixed(2)}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedMembers.map((memberId) => {
                          const member = members.find(m => m._id === memberId);
                          return (
                            <div key={memberId} className="flex justify-between items-center gap-2">
                              <div className="flex items-center space-x-2 min-w-[120px]">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={member?.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {member ? getInitials(member.name) : '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate max-w-[100px]">{member?.name}</span>
                              </div>
                              <div className="relative w-full max-w-[120px]">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  className="pl-6 h-8"
                                  value={customAmounts[memberId] || ''}
                                  onChange={(e) => handleCustomAmountChange(memberId, e.target.value)}
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {loading ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}