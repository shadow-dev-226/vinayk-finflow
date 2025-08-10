import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  amount: number;
  name?: string;
  reason?: string;
  user_id: string;
  created_at: string;
  users?: { name: string };
}

const ManageTransactions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incomeData, setIncomeData] = useState<Transaction[]>([]);
  const [expenseData, setExpenseData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({ amount: '', name: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const incomeQuery = user?.role === 'admin' 
        ? supabase.from('income').select(`*, users!inner(name)`)
        : supabase.from('income').select(`*, users!inner(name)`).eq('user_id', user?.id);
      
      const expenseQuery = user?.role === 'admin'
        ? supabase.from('expenses').select(`*, users!inner(name)`)
        : supabase.from('expenses').select(`*, users!inner(name)`).eq('user_id', user?.id);

      const [incomeResponse, expenseResponse] = await Promise.all([
        incomeQuery.order('created_at', { ascending: false }),
        expenseQuery.order('created_at', { ascending: false })
      ]);

      setIncomeData(incomeResponse.data || []);
      setExpenseData(expenseResponse.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (transaction: Transaction, type: 'income' | 'expense') => {
    setEditingTransaction({ ...transaction, type } as any);
    setEditForm({
      amount: transaction.amount.toString(),
      name: transaction.name || '',
      reason: transaction.reason || ''
    });
  };

  const handleUpdate = async () => {
    if (!editingTransaction) return;
    
    setIsSubmitting(true);
    try {
      const isIncome = 'name' in editingTransaction;
      const table = isIncome ? 'income' : 'expenses';
      const updateData = isIncome 
        ? { amount: parseFloat(editForm.amount), name: editForm.name }
        : { amount: parseFloat(editForm.amount), reason: editForm.reason };

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', editingTransaction.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${isIncome ? 'Income' : 'Expense'} updated successfully`
      });

      setEditingTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, type: 'income' | 'expense') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const table = type === 'income' ? 'income' : 'expenses';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${type} deleted successfully`
      });

      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const canEdit = (transaction: Transaction) => {
    return user?.role === 'admin' || transaction.user_id === user?.id;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Manage Transactions</h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' ? 'Edit and manage all transactions' : 'Edit and manage your transactions'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="income" className="space-y-6">
        <TabsList>
          <TabsTrigger value="income">Income ({incomeData.length})</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({expenseData.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle className="text-income">Income Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incomeData.map((income) => (
                  <div key={income.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{income.name}</p>
                      <p className="text-sm text-muted-foreground">
                        By {income.users?.name} • {new Date(income.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-income">
                        {formatCurrency(Number(income.amount))}
                      </span>
                      {canEdit(income) && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(income, 'income')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(income.id, 'income')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {incomeData.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No income records found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle className="text-expense">Expense Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenseData.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{expense.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        By {expense.users?.name} • {new Date(expense.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-expense">
                        {formatCurrency(Number(expense.amount))}
                      </span>
                      {canEdit(expense) && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(expense, 'expense')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(expense.id, 'expense')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {expenseData.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No expense records found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingTransaction && (
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Edit {'name' in editingTransaction ? 'Income' : 'Expense'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  placeholder="Enter amount"
                />
              </div>
              {'name' in editingTransaction ? (
                <div>
                  <Label htmlFor="name">Source</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Enter income source"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={editForm.reason}
                    onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                    placeholder="Enter expense reason"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingTransaction(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManageTransactions;