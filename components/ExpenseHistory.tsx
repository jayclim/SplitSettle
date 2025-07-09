import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Receipt, Calendar, DollarSign, Users, Filter } from 'lucide-react';
import { getExpenses, Expense } from '@/api/expenses';
import { useToast } from '@/hooks/useToast';
import { formatDistanceToNow } from 'date-fns';

interface ExpenseHistoryProps {
  groupId: string;
}

export function ExpenseHistory({ groupId }: ExpenseHistoryProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'settled' | 'unsettled'>('all');
  const { toast } = useToast();

  const loadExpenses = async () => {
    try {
      setLoading(true);
      console.log('Loading expenses for group:', groupId);
      const response = await getExpenses(groupId);
      setExpenses((response as { expenses: Expense[] }).expenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [groupId]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      'Food': 'bg-orange-100 text-orange-700',
      'Transportation': 'bg-blue-100 text-blue-700',
      'Entertainment': 'bg-purple-100 text-purple-700',
      'Shopping': 'bg-pink-100 text-pink-700',
      'Utilities': 'bg-green-100 text-green-700',
      'Other': 'bg-gray-100 text-gray-700'
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'settled') return expense.settled;
    if (filter === 'unsettled') return !expense.settled;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Expense History</h3>
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unsettled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unsettled')}
          >
            Unsettled
          </Button>
          <Button
            variant={filter === 'settled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('settled')}
          >
            Settled
          </Button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No expenses found</p>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <Card key={expense._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={expense.paidBy.avatar} />
                      <AvatarFallback>
                        {getInitials(expense.paidBy.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium truncate">{expense.description}</h4>
                        {expense.category && (
                          <Badge variant="secondary" className={`text-xs ${getCategoryColor(expense.category)}`}>
                            {expense.category}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span>Paid by {expense.paidBy.name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{expense.splitBetween.length} people</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(expense.createdAt), { addSuffix: true })}</span>
                        </span>
                      </div>

                      {/* Split Details */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {expense.splitBetween.slice(0, 3).map((split) => (
                          <Badge key={split._id} variant="outline" className="text-xs">
                            {split.name}: ${split.amount.toFixed(2)}
                          </Badge>
                        ))}
                        {expense.splitBetween.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{expense.splitBetween.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <p className="text-lg font-semibold">${expense.amount.toFixed(2)}</p>
                      <Badge variant={expense.settled ? 'default' : 'secondary'} className="text-xs">
                        {expense.settled ? 'Settled' : 'Pending'}
                      </Badge>
                    </div>
                    
                    {expense.receipt && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Receipt className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}