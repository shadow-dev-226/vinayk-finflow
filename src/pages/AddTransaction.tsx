import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

const AddTransaction: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Income form state
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeName, setIncomeName] = useState('');

  // Expense form state
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeAmount || !incomeName) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('income')
        .insert({
          user_id: user?.id,
          amount: parseFloat(incomeAmount),
          name: incomeName.trim()
        });

      if (error) throw error;

      toast({
        title: "Income added successfully",
        description: `₹${incomeAmount} has been recorded as income.`,
      });

      // Reset form
      setIncomeAmount('');
      setIncomeName('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add income. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseReason) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user?.id,
          amount: parseFloat(expenseAmount),
          reason: expenseReason.trim()
        });

      if (error) throw error;

      toast({
        title: "Expense added successfully",
        description: `₹${expenseAmount} has been recorded as expense.`,
      });

      // Reset form
      setExpenseAmount('');
      setExpenseReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Transaction</h1>
        <p className="text-muted-foreground">Record income or expenses for the organization</p>
      </div>

      <div className="max-w-2xl">
        <Tabs defaultValue="income" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="income" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Income
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Expense
            </TabsTrigger>
          </TabsList>

          {/* Income Tab */}
          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-income">
                  <TrendingUp className="h-5 w-5" />
                  Add Income
                </CardTitle>
                <CardDescription>
                  Record money received by the organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIncomeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="incomeAmount">Amount (₹)</Label>
                    <Input
                      id="incomeAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={incomeAmount}
                      onChange={(e) => setIncomeAmount(e.target.value)}
                      placeholder="Enter income amount"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incomeName">Income Source/Name</Label>
                    <Input
                      id="incomeName"
                      value={incomeName}
                      onChange={(e) => setIncomeName(e.target.value)}
                      placeholder="e.g., Membership fees, Donations, etc."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Added By</Label>
                    <Input value={`${user?.name} (${user?.id})`} disabled />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !incomeAmount || !incomeName}
                    className="w-full bg-gradient-income hover:opacity-90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Income...
                      </>
                    ) : (
                      'Add Income'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expense Tab */}
          <TabsContent value="expense">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-expense">
                  <TrendingDown className="h-5 w-5" />
                  Add Expense
                </CardTitle>
                <CardDescription>
                  Record money spent by the organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expenseAmount">Amount (₹)</Label>
                    <Input
                      id="expenseAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="Enter expense amount"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expenseReason">Reason/Description</Label>
                    <Textarea
                      id="expenseReason"
                      value={expenseReason}
                      onChange={(e) => setExpenseReason(e.target.value)}
                      placeholder="e.g., Office supplies, Event expenses, Utilities, etc."
                      required
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Added By</Label>
                    <Input value={`${user?.name} (${user?.id})`} disabled />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !expenseAmount || !expenseReason}
                    className="w-full bg-gradient-expense hover:opacity-90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Expense...
                      </>
                    ) : (
                      'Add Expense'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AddTransaction;