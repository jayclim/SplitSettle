import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Sparkles, Mic, Camera, Loader2, Check, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { processAIExpense, createExpense, CreateExpenseData } from '@/api/expenses';
import { GroupMember } from '@/api/groups';
import { useToast } from '@/hooks/useToast';

interface AIExpenseModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  members: GroupMember[];
  onExpenseCreated: () => void;
}

interface AIFormData {
  description: string;
}

export function AIExpenseModal({ open, onClose, groupId, members, onExpenseCreated }: AIExpenseModalProps) {
  const [step, setStep] = useState<'input' | 'processing' | 'confirm'>('input');
  const [loading, setLoading] = useState(false);
  const [parsedExpense, setParsedExpense] = useState<Partial<CreateExpenseData> | null>(null);
  const [recording, setRecording] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch } = useForm<AIFormData>();
  const { register: registerConfirm, handleSubmit: handleConfirmSubmit, setValue: setConfirmValue, watch: watchConfirm } = useForm<CreateExpenseData>();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAIProcess = async (data: AIFormData) => {
    try {
      setLoading(true);
      setStep('processing');
      console.log('Processing AI expense:', data);
      
      const result = await processAIExpense({
        groupId,
        description: data.description
      });

      setParsedExpense(result.parsedExpense);
      
      // Pre-fill confirmation form
      setConfirmValue('groupId', groupId);
      setConfirmValue('description', result.parsedExpense.description || '');
      setConfirmValue('amount', result.parsedExpense.amount || 0);
      setConfirmValue('splitBetween', result.parsedExpense.splitBetween || []);
      setConfirmValue('splitType', result.parsedExpense.splitType || 'equal');
      setConfirmValue('paidById', members[0]._id); // Default to first member
      
      setStep('confirm');
    } catch (error) {
      console.error('Error processing AI expense:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process expense",
        variant: "destructive",
      });
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmExpense = async (data: CreateExpenseData) => {
    try {
      setLoading(true);
      console.log('Creating confirmed expense:', data);
      await createExpense(data);
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
    setStep('input');
    setParsedExpense(null);
    reset();
  };

  const handleVoiceRecord = () => {
    setRecording(!recording);
    // Voice recording logic would go here
    toast({
      title: "Voice recording",
      description: "Voice input will be available soon",
    });
  };

  const selectedMembers = watchConfirm('splitBetween') || [];
  const splitType = watchConfirm('splitType') || 'equal';
  const totalAmount = watchConfirm('amount') || 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span>AI Expense Assistant</span>
          </DialogTitle>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Describe your expense in natural language and let AI handle the rest!
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-sm text-muted-foreground">
                <Badge variant="outline">"I paid $45 for lunch for me and Sarah"</Badge>
                <Badge variant="outline">"Split $120 dinner 4 ways"</Badge>
                <Badge variant="outline">"Uber to airport $35, split with roommates"</Badge>
              </div>
            </div>

            <form onSubmit={handleSubmit(handleAIProcess)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Describe your expense</Label>
                <Textarea
                  id="description"
                  {...register('description', { required: 'Please describe your expense' })}
                  placeholder="I paid $45 for tacos for me, Ben, and Chloe..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVoiceRecord}
                  className={`flex-1 ${recording ? 'bg-red-50 border-red-200' : ''}`}
                >
                  <Mic className={`h-4 w-4 mr-2 ${recording ? 'text-red-500' : ''}`} />
                  {recording ? 'Recording...' : 'Voice Input'}
                </Button>
                <Button type="button" variant="outline" className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Scan Receipt
                </Button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Process with AI
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI is working its magic...</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>🔍 Analyzing your description</p>
              <p>💰 Extracting amount and participants</p>
              <p>✨ Almost done...</p>
            </div>
          </div>
        )}

        {step === 'confirm' && parsedExpense && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">AI Analysis Complete</span>
              </div>
              <p className="text-sm text-green-700">
                Review and adjust the details below, then confirm to add the expense.
              </p>
            </div>

            <form onSubmit={handleConfirmSubmit(handleConfirmExpense)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirmDescription">Description</Label>
                <Input
                  id="confirmDescription"
                  {...registerConfirm('description', { required: 'Description is required' })}
                  defaultValue={parsedExpense.description}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    {...registerConfirm('amount', { required: 'Amount is required', min: 0.01 })}
                    defaultValue={parsedExpense.amount}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paidBy">Paid by</Label>
                  <Select onValueChange={(value) => setConfirmValue('paidById', value)} defaultValue={members[0]._id}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member._id} value={member._id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Split between</Label>
                <div className="grid grid-cols-2 gap-2">
                  {members.map((member) => (
                    <label key={member._id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...registerConfirm('splitBetween')}
                        value={member._id}
                        defaultChecked={parsedExpense.splitBetween?.includes(member._id)}
                        className="rounded"
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedMembers.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Split Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedMembers.map((memberId) => {
                        const member = members.find(m => m._id === memberId);
                        const amount = splitType === 'equal' ? totalAmount / selectedMembers.length : 0;
                        return (
                          <div key={memberId} className="flex justify-between items-center">
                            <span className="text-sm">{member?.name}</span>
                            <Badge variant="secondary">${amount.toFixed(2)}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('input')}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {loading ? 'Adding...' : 'Looks Perfect!'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}