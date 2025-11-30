import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Plus, Calculator, Upload, Camera } from 'lucide-react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateExpenseData>({
    defaultValues: {
      splitType: 'equal',
      paidById: currentUserId || undefined,
    }
  });

  // Update default paidById when currentUserId changes or modal opens
  useEffect(() => {
    if (open && currentUserId) {
      setValue('paidById', currentUserId);
    }
  }, [open, currentUserId, setValue]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "Receipt uploaded",
        description: `${file.name} has been attached`,
      });
    }
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

      console.log('Creating manual expense:', data);
      await createExpenseAction({
        ...data,
        groupId,
        splitType: data.splitType || 'equal'
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
    setSelectedFile(null);
  };

  const handleSelectAll = () => {
    const allMemberIds = members.map(m => m._id);
    setValue('splitBetween', allMemberIds);
  };

  const selectedMembers = watch('splitBetween') || [];
  const totalAmount = watch('amount') || 0;

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
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount', { required: 'Amount is required', min: 0.01 })}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>
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
                  <label key={member._id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      {...register('splitBetween')}
                      value={member._id}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
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

            {/* Receipt Upload - Commented out for now */}
            {/* <div className="space-y-2">
              <Label>Receipt (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    {selectedFile ? (
                      <>
                        <Camera className="h-8 w-8 text-green-600" />
                        <p className="text-sm font-medium text-green-600">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">Click to change</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-sm font-medium">Upload receipt</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div> */}

            {/* Split Summary */}
            {selectedMembers.length > 0 && totalAmount > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Split Summary</CardTitle>
                </CardHeader>
                <CardContent>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}