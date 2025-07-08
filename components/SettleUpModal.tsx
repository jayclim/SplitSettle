import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { CreditCard, Smartphone, Banknote, Building, ExternalLink, Check, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createSettlement, CreateSettlementData } from '@/api/balances';
import { useToast } from '@/hooks/useToast';

interface SettleUpModalProps {
  open: boolean;
  onClose: () => void;
  balance: {
    userId: string;
    userName: string;
    userAvatar?: string;
    amount: number;
  };
  groupId: string;
  onSettlementCreated: () => void;
}

interface SettlementFormData {
  amount: number;
  method: string;
  notes?: string;
}

export function SettleUpModal({ open, onClose, balance, groupId, onSettlementCreated }: SettleUpModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [step, setStep] = useState<'method' | 'details' | 'confirm'>('method');
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SettlementFormData>({
    defaultValues: {
      amount: Math.abs(balance.amount),
      method: '',
      notes: ''
    }
  });

  const paymentMethods = [
    {
      id: 'venmo',
      name: 'Venmo',
      description: 'Send money instantly',
      icon: <Smartphone className="h-6 w-6" />,
      color: 'bg-blue-500',
      popular: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Secure online payments',
      icon: <CreditCard className="h-6 w-6" />,
      color: 'bg-blue-600'
    },
    {
      id: 'cash',
      name: 'Cash',
      description: 'Pay in person',
      icon: <Banknote className="h-6 w-6" />,
      color: 'bg-green-600'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
      icon: <Building className="h-6 w-6" />,
      color: 'bg-gray-600'
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setValue('method', methodId);
    setStep('details');
  };

  const onSubmit = async (data: SettlementFormData) => {
    if (step === 'details') {
      setStep('confirm');
      return;
    }

    try {
      setLoading(true);
      console.log('Creating settlement:', data);
      await createSettlement({
        groupId,
        toUserId: balance.userId,
        amount: data.amount,
        method: data.method,
        notes: data.notes
      });
      
      toast({
        title: "Settlement created!",
        description: `Payment request sent to ${balance.userName}`,
      });
      
      handleClose();
      onSettlementCreated();
    } catch (error) {
      console.error('Error creating settlement:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create settlement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep('method');
    setSelectedMethod('');
    reset();
  };

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
  const watchedAmount = watch('amount');
  const watchedNotes = watch('notes');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <span>Settle Up</span>
          </DialogTitle>
          <DialogDescription>
            {step === 'method' && 'Choose how you want to pay'}
            {step === 'details' && 'Enter payment details'}
            {step === 'confirm' && 'Confirm your payment'}
          </DialogDescription>
        </DialogHeader>

        {/* Payment recipient info */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={balance.userAvatar} />
                  <AvatarFallback>{getInitials(balance.userName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Pay {balance.userName}</p>
                  <p className="text-sm text-muted-foreground">You owe</p>
                </div>
              </div>
              <Badge className="bg-red-100 text-red-700 border-red-200">
                ${Math.abs(balance.amount).toFixed(2)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {step === 'method' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select your preferred payment method</p>
            {paymentMethods.map((method) => (
              <Card
                key={method.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
                onClick={() => handleMethodSelect(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${method.color} rounded-lg flex items-center justify-center text-white`}>
                        {method.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{method.name}</p>
                          {method.popular && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(step === 'details' || step === 'confirm') && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 'details' && (
              <>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 ${selectedMethodData?.color} rounded-lg flex items-center justify-center text-white`}>
                    {selectedMethodData?.icon}
                  </div>
                  <span className="font-medium">{selectedMethodData?.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep('method')}
                    className="ml-auto text-blue-600 hover:text-blue-700"
                  >
                    Change
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    {...register('amount', { 
                      required: 'Amount is required', 
                      min: { value: 0.01, message: 'Amount must be greater than 0' },
                      max: { value: Math.abs(balance.amount), message: 'Amount cannot exceed what you owe' }
                    })}
                    className="text-lg font-medium"
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount.message}</p>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('amount', Math.abs(balance.amount) / 2)}
                    >
                      Half (${(Math.abs(balance.amount) / 2).toFixed(2)})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('amount', Math.abs(balance.amount))}
                    >
                      Full Amount
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Add a note about this payment..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {step === 'confirm' && (
              <div className="space-y-4">
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Payment Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 ${selectedMethodData?.color} rounded flex items-center justify-center`}>
                          <div className="w-3 h-3 text-white">
                            {selectedMethodData?.icon}
                          </div>
                        </div>
                        <span className="font-medium">{selectedMethodData?.name}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium text-lg">${watchedAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-medium">{balance.userName}</span>
                    </div>
                    {watchedNotes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">Note:</p>
                        <p className="text-sm">{watchedNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedMethod === 'venmo' && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 text-blue-700">
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm">You'll be redirected to Venmo to complete the payment</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={step === 'confirm' ? () => setStep('details') : handleClose}
                className="flex-1"
              >
                {step === 'confirm' ? 'Back' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {loading ? 'Processing...' : step === 'details' ? 'Review Payment' : 'Send Payment Request'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}