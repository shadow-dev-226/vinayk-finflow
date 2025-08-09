import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  name?: string;
  reason?: string;
  user_id: string;
  created_at: string;
  users?: { name: string };
}

interface ChartData {
  name: string;
  income: number;
  expenses: number;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [incomeData, setIncomeData] = useState<Transaction[]>([]);
  const [expenseData, setExpenseData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch income data with user names
      const { data: income } = await supabase
        .from('income')
        .select(`
          id,
          amount,
          name,
          user_id,
          created_at,
          users!inner(name)
        `)
        .order('created_at', { ascending: false });

      // Fetch expense data with user names
      const { data: expenses } = await supabase
        .from('expenses')
        .select(`
          id,
          amount,
          reason,
          user_id,
          created_at,
          users!inner(name)
        `)
        .order('created_at', { ascending: false });

      setIncomeData(income || []);
      setExpenseData(expenses || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredData = (data: Transaction[], period: string) => {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    return data.filter(item => new Date(item.created_at) >= startDate);
  };

  const getChartData = (): ChartData[] => {
    const filteredIncome = getFilteredData(incomeData, period);
    const filteredExpenses = getFilteredData(expenseData, period);

    if (period === 'day') {
      // Group by hour for daily view
      const hours = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0') + ':00';
        const hourIncome = filteredIncome
          .filter(item => new Date(item.created_at).getHours() === i)
          .reduce((sum, item) => sum + Number(item.amount), 0);
        const hourExpenses = filteredExpenses
          .filter(item => new Date(item.created_at).getHours() === i)
          .reduce((sum, item) => sum + Number(item.amount), 0);

        return {
          name: hour,
          income: hourIncome,
          expenses: hourExpenses
        };
      }).filter(item => item.income > 0 || item.expenses > 0);

      return hours.length > 0 ? hours : [{ name: 'No Data', income: 0, expenses: 0 }];
    } else if (period === 'week') {
      // Group by day for weekly view
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dayIncome = filteredIncome
          .filter(item => new Date(item.created_at).toDateString() === date.toDateString())
          .reduce((sum, item) => sum + Number(item.amount), 0);
        const dayExpenses = filteredExpenses
          .filter(item => new Date(item.created_at).toDateString() === date.toDateString())
          .reduce((sum, item) => sum + Number(item.amount), 0);

        return {
          name: dayName,
          income: dayIncome,
          expenses: dayExpenses
        };
      }).reverse();

      return days;
    } else {
      // Group by week for monthly view
      const weeks = Array.from({ length: 4 }, (_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekIncome = filteredIncome
          .filter(item => {
            const itemDate = new Date(item.created_at);
            return itemDate >= weekStart && itemDate <= weekEnd;
          })
          .reduce((sum, item) => sum + Number(item.amount), 0);

        const weekExpenses = filteredExpenses
          .filter(item => {
            const itemDate = new Date(item.created_at);
            return itemDate >= weekStart && itemDate <= weekEnd;
          })
          .reduce((sum, item) => sum + Number(item.amount), 0);

        return {
          name: `Week ${4 - i}`,
          income: weekIncome,
          expenses: weekExpenses
        };
      }).reverse();

      return weeks;
    }
  };

  const getPieData = () => {
    const filteredIncome = getFilteredData(incomeData, period);
    const filteredExpenses = getFilteredData(expenseData, period);

    const totalIncome = filteredIncome.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

    return [
      { name: 'Income', value: totalIncome, color: 'hsl(var(--income))' },
      { name: 'Expenses', value: totalExpenses, color: 'hsl(var(--expense))' }
    ];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const pieData = getPieData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Financial insights from all members</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2"
        >
          {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
      </div>

      {/* Period Selector */}
      <Tabs value={period} onValueChange={(value) => setPeriod(value as any)}>
        <TabsList>
          <TabsTrigger value="day">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-income" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-income">
                  {formatCurrency(pieData[0]?.value || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {getFilteredData(incomeData, period).length} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-expense" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-expense">
                  {formatCurrency(pieData[1]?.value || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {getFilteredData(expenseData, period).length} transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>
                  Comparison over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(Number(value)), name]}
                    />
                    <Bar dataKey="income" fill="hsl(var(--income))" />
                    <Bar dataKey="expenses" fill="hsl(var(--expense))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution</CardTitle>
                <CardDescription>
                  Income vs expenses breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Details */}
          {showDetails && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Income */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-income">Recent Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getFilteredData(incomeData, period).slice(0, 5).map((income) => (
                      <div key={income.id} className="flex justify-between items-center p-3 bg-income-light rounded-lg">
                        <div>
                          <p className="font-medium">{income.name}</p>
                          <p className="text-sm text-muted-foreground">
                            By {income.users?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-income">
                            {formatCurrency(Number(income.amount))}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(income.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {getFilteredData(incomeData, period).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No income records found</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-expense">Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getFilteredData(expenseData, period).slice(0, 5).map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center p-3 bg-expense-light rounded-lg">
                        <div>
                          <p className="font-medium">{expense.reason}</p>
                          <p className="text-sm text-muted-foreground">
                            By {expense.users?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-expense">
                            {formatCurrency(Number(expense.amount))}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {getFilteredData(expenseData, period).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No expense records found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;