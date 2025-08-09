import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      // Fetch all income records
      const { data: incomeData } = await supabase
        .from('income')
        .select('amount');

      // Fetch all expense records  
      const { data: expenseData } = await supabase
        .from('expenses')
        .select('amount');

      const totalIncome = incomeData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
      const totalExpenses = expenseData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
      const balance = totalIncome - totalExpenses;

      setFinancialData({
        totalIncome,
        totalExpenses,
        balance
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-positive';
    if (balance < 0) return 'text-negative';
    return 'text-neutral';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return TrendingUp;
    if (balance < 0) return TrendingDown;
    return DollarSign;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const BalanceIcon = getBalanceIcon(financialData.balance);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-white/80">
          Here's your financial overview for Vinayk Mitra Mandal
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Income Card */}
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
            <div className="w-8 h-8 bg-income/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-income" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-income">
                {formatCurrency(financialData.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                From all members
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <div className="w-8 h-8 bg-expense/10 rounded-full flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-expense" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(financialData.totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                All expenditures
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              financialData.balance > 0 ? 'bg-positive/10' : 
              financialData.balance < 0 ? 'bg-negative/10' : 'bg-neutral/10'
            }`}>
              <BalanceIcon className={`h-4 w-4 ${getBalanceColor(financialData.balance)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className={`text-2xl font-bold ${getBalanceColor(financialData.balance)}`}>
                {formatCurrency(financialData.balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Net position
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Financial Health</h4>
              <div className={`text-lg font-semibold ${getBalanceColor(financialData.balance)}`}>
                {financialData.balance > 0 ? 'Positive' : 
                 financialData.balance < 0 ? 'Deficit' : 'Balanced'}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Your Role</h4>
              <div className="text-lg font-semibold capitalize">
                {user?.role}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;