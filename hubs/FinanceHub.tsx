import React, { useState, useEffect } from 'react';

type FinanceSubView = 'overview' | 'dashboard' | 'calendar' | 'tx' | 'savings' | 'debt' | 'settings';
type OverviewMode = 'year' | 'month';

interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // day of month (1-31)
  frequency: 'monthly' | 'yearly';
  category: string;
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  frequency: 'monthly' | 'yearly';
}

interface Income {
  id: string;
  source: string;
  amount: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  payDay?: string; // Day of week for weekly/bi-weekly, or day of month for monthly
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: number;
}

interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  frequency: 'monthly' | 'yearly';
  emoji?: string;
  category?: string;
}

interface OneTimeItem {
  id: string;
  name: string;
  amount: number;
  date: number; // day of month
  month: number; // 0-11
  year: number;
  type: 'bill' | 'expense' | 'subscription' | 'income' | 'savings';
  emoji?: string;
  description?: string;
  logo?: string;
}

const FinanceHub: React.FC = () => {
  const [currentView, setCurrentView] = useState<FinanceSubView>('overview');

  useEffect(() => {
    const handleSubNav = (e: any) => {
      if (e.detail && e.detail.subView) {
        setCurrentView(e.detail.subView as FinanceSubView);
      }
    };
    window.addEventListener('hubSubNavChange', handleSubNav);
    return () => window.removeEventListener('hubSubNavChange', handleSubNav);
  }, []);

  // ============== STATE MANAGEMENT WITH LOCALSTORAGE ==============
  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem('luxelife_finance_incomes');
    return saved ? JSON.parse(saved) : [
      { id: 'i1', source: 'Primary Job', amount: 5000, frequency: 'monthly' },
      { id: 'i2', source: 'Freelance', amount: 1500, frequency: 'monthly' },
    ];
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('luxelife_finance_bills');
    return saved ? JSON.parse(saved) : [
      { id: 'b1', name: 'Rent', amount: 1800, dueDate: 1, frequency: 'monthly', category: 'Housing' },
      { id: 'b2', name: 'Electric', amount: 120, dueDate: 15, frequency: 'monthly', category: 'Utilities' },
      { id: 'b3', name: 'Internet', amount: 80, dueDate: 10, frequency: 'monthly', category: 'Utilities' },
      { id: 'b4', name: 'Car Insurance', amount: 150, dueDate: 5, frequency: 'monthly', category: 'Insurance' },
    ];
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('luxelife_finance_subscriptions');
    return saved ? JSON.parse(saved) : [
      { id: 's1', name: 'Netflix', amount: 15.99, dueDate: 12, frequency: 'monthly' },
      { id: 's2', name: 'Spotify', amount: 9.99, dueDate: 8, frequency: 'monthly' },
      { id: 's3', name: 'Gym Membership', amount: 60, dueDate: 1, frequency: 'monthly' },
      { id: 's4', name: 'Amazon Prime', amount: 139, dueDate: 15, frequency: 'yearly' },
    ];
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('luxelife_finance_savings');
    return saved ? JSON.parse(saved) : [
      { id: 'sg1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 7500, deadline: '2024-12-31' },
      { id: 'sg2', name: 'Vacation', targetAmount: 5000, currentAmount: 2300, deadline: '2024-06-01' },
    ];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('luxelife_finance_debts');
    return saved ? JSON.parse(saved) : [
      { id: 'd1', name: 'Student Loan', totalAmount: 25000, remainingAmount: 18000, interestRate: 4.5, minimumPayment: 250, dueDate: 20 },
      { id: 'd2', name: 'Credit Card', totalAmount: 5000, remainingAmount: 2400, interestRate: 18.9, minimumPayment: 100, dueDate: 25 },
    ];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('luxelife_finance_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 't1', date: '2024-10-25', description: 'Grocery Shopping', category: 'Food', amount: -85.43, type: 'expense' },
      { id: 't2', date: '2024-10-24', description: 'Gas Station', category: 'Transportation', amount: -52.00, type: 'expense' },
      { id: 't3', date: '2024-10-23', description: 'Freelance Payment', category: 'Income', amount: 1500, type: 'income' },
    ];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('luxelife_finance_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('luxelife_finance_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('luxelife_finance_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('luxelife_finance_savings', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('luxelife_finance_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('luxelife_finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem('luxelife_finance_recurring_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('luxelife_finance_recurring_expenses', JSON.stringify(recurringExpenses));
  }, [recurringExpenses]);

  // One-time items storage (stored with month/year context)
  const [oneTimeItems, setOneTimeItems] = useState<OneTimeItem[]>([]);

  // Calculate totals
  const monthlyIncome = incomes.reduce((sum, inc) => {
    if (inc.frequency === 'monthly') return sum + inc.amount;
    if (inc.frequency === 'weekly') return sum + (inc.amount * 4);
    if (inc.frequency === 'bi-weekly') return sum + (inc.amount * 2);
    if (inc.frequency === 'yearly') return sum + (inc.amount / 12);
    return sum;
  }, 0);

  const monthlyBills = bills.reduce((sum, bill) => {
    return sum + (bill.frequency === 'monthly' ? bill.amount : bill.amount / 12);
  }, 0);

  const monthlySubscriptions = subscriptions.reduce((sum, sub) => {
    return sum + (sub.frequency === 'monthly' ? sub.amount : sub.amount / 12);
  }, 0);

  const monthlyExpenses = monthlyBills + monthlySubscriptions;
  const leftToSpend = monthlyIncome - monthlyExpenses;

  // ============== OVERVIEW VIEW ==============
  const OverviewView = () => {
    const [overviewMode, setOverviewMode] = useState<OverviewMode>('year');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
      income: false,
      bills: false,
      subscriptions: false,
      expenses: false,
      debt: false,
      savings: false,
    });

    // One-time items state
    const [showOneTimeModal, setShowOneTimeModal] = useState(false);
    const [oneTimeItemType, setOneTimeItemType] = useState<'bill' | 'expense' | 'subscription' | 'income' | 'savings'>('expense');
    const [oneTimeForm, setOneTimeForm] = useState({
      name: '',
      amount: 0,
      date: new Date().getDate(),
      emoji: '💰',
      description: '',
      logo: ''
    });

    // Handler to open one-time item modal
    const handleOpenOneTimeModal = (type: 'bill' | 'expense' | 'subscription' | 'income' | 'savings') => {
      setOneTimeItemType(type);
      setOneTimeForm({
        name: '',
        amount: 0,
        date: new Date().getDate(),
        emoji: type === 'bill' ? '📋' : type === 'expense' ? '💰' : type === 'subscription' ? '📺' : type === 'income' ? '💵' : '🎯',
        description: '',
        logo: ''
      });
      setShowOneTimeModal(true);
    };

    // Handler to save one-time item
    const handleSaveOneTimeItem = () => {
      const newItem: OneTimeItem = {
        id: `oti-${Date.now()}`,
        name: oneTimeForm.name,
        amount: oneTimeForm.amount,
        date: oneTimeForm.date,
        month: selectedMonth,
        year: selectedYear,
        type: oneTimeItemType,
        emoji: oneTimeForm.emoji,
        description: oneTimeForm.description,
        logo: oneTimeForm.logo
      };

      setOneTimeItems(prev => [...prev, newItem]);
      setShowOneTimeModal(false);
      setOneTimeForm({
        name: '',
        amount: 0,
        date: new Date().getDate(),
        emoji: '💰',
        description: '',
        logo: ''
      });
    };

    const toggleSection = (section: string) => {
      setCollapsedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Mock monthly expenses data
    const monthlyExpensesList = [
      { id: 'e1', description: 'Grocery Shopping', category: 'Food', amount: 450, date: '15th' },
      { id: 'e2', description: 'Gas', category: 'Transportation', amount: 80, date: '18th' },
      { id: 'e3', description: 'Restaurant', category: 'Dining', amount: 120, date: '22nd' },
    ];

    // Calculate annual totals
    const annualIncome = monthlyIncome * 12;
    const annualExpenses = monthlyExpenses * 12;
    const annualSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const annualLeftToSpend = annualIncome - annualExpenses;

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-main dark:text-white">
              {overviewMode === 'year' ? `${selectedYear} Overview` : `${months[selectedMonth]} ${selectedYear}`}
            </h1>
            <p className="text-text-muted mt-0.5 font-medium text-sm">
              {overviewMode === 'year' ? 'Annual financial summary' : 'Monthly financial breakdown'}
            </p>
          </div>
          <div className="flex gap-2 bg-background-light dark:bg-background-dark rounded-xl p-1">
            <button
              onClick={() => setOverviewMode('year')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                overviewMode === 'year' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setOverviewMode('month')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                overviewMode === 'month' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {overviewMode === 'year' ? (
          // YEAR VIEW
          <div className="space-y-6">
            {/* Annual Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl p-6 shadow-lg">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Annual Income</p>
                <p className="text-3xl font-black">${annualIncome.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Annual Expenses</p>
                <p className="text-3xl font-black">${annualExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-6 shadow-lg">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Annual Savings</p>
                <p className="text-3xl font-black">${annualSavings.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl p-6 shadow-lg">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Left to Spend</p>
                <p className="text-3xl font-black">${annualLeftToSpend.toLocaleString()}</p>
              </div>
            </div>

            {/* 12 Month Grid */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Monthly Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {months.map((month, idx) => (
                  <div
                    key={month}
                    onClick={() => {
                      setSelectedMonth(idx);
                      setOverviewMode('month');
                    }}
                    className="bg-background-light dark:bg-background-dark rounded-xl p-4 hover:bg-primary/5 hover:border-primary/30 border-2 border-transparent transition-all cursor-pointer group"
                  >
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">{month}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-medium text-text-muted">Income</span>
                        <span className="text-sm font-bold text-emerald-500">${monthlyIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-medium text-text-muted">Expenses</span>
                        <span className="text-sm font-bold text-rose-500">${monthlyExpenses.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-text-muted">Left</span>
                          <span className="text-sm font-black text-primary">${leftToSpend.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // MONTH VIEW
          <div className="space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setSelectedMonth(selectedMonth === 0 ? 11 : selectedMonth - 1)}
                className="size-10 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="text-center">
                <p className="text-2xl font-black">{months[selectedMonth]} {selectedYear}</p>
              </div>
              <button
                onClick={() => setSelectedMonth(selectedMonth === 11 ? 0 : selectedMonth + 1)}
                className="size-10 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-surface-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Total Income</p>
                <p className="text-2xl font-black text-emerald-500">${monthlyIncome.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-surface-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Total Expenses</p>
                <p className="text-2xl font-black text-rose-500">${monthlyExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-surface-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Left to Spend</p>
                <p className="text-2xl font-black text-primary">${leftToSpend.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-surface-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Left to Budget</p>
                <p className="text-2xl font-black text-text-main dark:text-white">${leftToSpend.toLocaleString()}</p>
              </div>
            </div>

            {/* Add Item Button */}
            <div className="flex justify-end mb-4">
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  Add One-Time Item
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="p-2">
                    <button
                      onClick={() => handleOpenOneTimeModal('bill')}
                      className="w-full px-4 py-2.5 text-left rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all flex items-center gap-3 group/item"
                    >
                      <span className="text-2xl">📋</span>
                      <div>
                        <p className="text-sm font-bold text-text-main dark:text-white group-hover/item:text-orange-600">Add Bill</p>
                        <p className="text-xs text-text-muted">One-time payment</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleOpenOneTimeModal('expense')}
                      className="w-full px-4 py-2.5 text-left rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all flex items-center gap-3 group/item"
                    >
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="text-sm font-bold text-text-main dark:text-white group-hover/item:text-blue-600">Add Expense</p>
                        <p className="text-xs text-text-muted">One-time expense</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleOpenOneTimeModal('subscription')}
                      className="w-full px-4 py-2.5 text-left rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all flex items-center gap-3 group/item"
                    >
                      <span className="text-2xl">📺</span>
                      <div>
                        <p className="text-sm font-bold text-text-main dark:text-white group-hover/item:text-purple-600">Add Subscription</p>
                        <p className="text-xs text-text-muted">One-time charge</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleOpenOneTimeModal('income')}
                      className="w-full px-4 py-2.5 text-left rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-3 group/item"
                    >
                      <span className="text-2xl">💵</span>
                      <div>
                        <p className="text-sm font-bold text-text-main dark:text-white group-hover/item:text-emerald-600">Add Income</p>
                        <p className="text-xs text-text-muted">One-time income</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleOpenOneTimeModal('savings')}
                      className="w-full px-4 py-2.5 text-left rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-950/20 transition-all flex items-center gap-3 group/item"
                    >
                      <span className="text-2xl">🎯</span>
                      <div>
                        <p className="text-sm font-bold text-text-main dark:text-white group-hover/item:text-cyan-600">Add Savings</p>
                        <p className="text-xs text-text-muted">One-time deposit</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Income Section */}
              <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection('income')}
                  className="w-full p-6 flex items-center justify-between hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  <div className="flex items-center justify-between flex-1 mr-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500">payments</span>
                      Income
                    </h3>
                    <span className="text-xl font-black text-emerald-500">${monthlyIncome.toLocaleString()}</span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform ${collapsedSections.income ? '' : 'rotate-180'}`}>
                    expand_more
                  </span>
                </button>
                {!collapsedSections.income && (
                  <div className="px-6 pb-6 max-h-80 overflow-y-auto">
                    <div className="space-y-2">
                      {incomes.map(income => (
                        <div key={income.id} className="flex justify-between items-center p-3 rounded-xl bg-background-light dark:bg-background-dark">
                          <div>
                            <p className="text-sm font-bold">{income.source}</p>
                            <p className="text-xs text-text-muted capitalize">
                              {income.frequency}
                              {income.payDay && ` • ${income.payDay}s`}
                            </p>
                          </div>
                          <span className="text-sm font-black text-emerald-500">${income.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bills Section */}
              <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection('bills')}
                  className="w-full p-6 flex items-center justify-between hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  <div className="flex items-center justify-between flex-1 mr-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-500">receipt</span>
                      Bills
                    </h3>
                    <span className="text-xl font-black text-orange-500">${monthlyBills.toLocaleString()}</span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform ${collapsedSections.bills ? '' : 'rotate-180'}`}>
                    expand_more
                  </span>
                </button>
                {!collapsedSections.bills && (
                  <div className="px-6 pb-6 max-h-80 overflow-y-auto">
                    <div className="space-y-2">
                      {bills.map(bill => (
                        <div key={bill.id} className="flex justify-between items-center p-3 rounded-xl bg-background-light dark:bg-background-dark">
                          <div>
                            <p className="text-sm font-bold">{bill.name}</p>
                            <p className="text-xs text-text-muted">Due: {bill.dueDate}th</p>
                          </div>
                          <span className="text-sm font-black text-rose-500">${bill.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Subscriptions Section */}
              <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection('subscriptions')}
                  className="w-full p-6 flex items-center justify-between hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  <div className="flex items-center justify-between flex-1 mr-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-500">subscriptions</span>
                      Subscriptions
                    </h3>
                    <span className="text-xl font-black text-purple-500">${monthlySubscriptions.toLocaleString()}</span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform ${collapsedSections.subscriptions ? '' : 'rotate-180'}`}>
                    expand_more
                  </span>
                </button>
                {!collapsedSections.subscriptions && (
                  <div className="px-6 pb-6 max-h-80 overflow-y-auto">
                    <div className="space-y-2">
                      {subscriptions.filter(s => s.frequency === 'monthly').map(sub => (
                        <div key={sub.id} className="flex justify-between items-center p-3 rounded-xl bg-background-light dark:bg-background-dark">
                          <div>
                            <p className="text-sm font-bold">{sub.name}</p>
                            <p className="text-xs text-text-muted">Due: {sub.dueDate}th</p>
                          </div>
                          <span className="text-sm font-black text-purple-500">${sub.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Expenses Section (NEW) */}
              <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection('expenses')}
                  className="w-full p-6 flex items-center justify-between hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  <div className="flex items-center justify-between flex-1 mr-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500">shopping_cart</span>
                      Expenses
                    </h3>
                    <span className="text-xl font-black text-blue-500">${monthlyExpensesList.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform ${collapsedSections.expenses ? '' : 'rotate-180'}`}>
                    expand_more
                  </span>
                </button>
                {!collapsedSections.expenses && (
                  <div className="px-6 pb-6 max-h-80 overflow-y-auto">
                    <div className="space-y-2">
                      {monthlyExpensesList.map(expense => (
                        <div key={expense.id} className="flex justify-between items-center p-3 rounded-xl bg-background-light dark:bg-background-dark">
                          <div>
                            <p className="text-sm font-bold">{expense.description}</p>
                            <p className="text-xs text-text-muted">{expense.category} • {expense.date}</p>
                          </div>
                          <span className="text-sm font-black text-blue-600 dark:text-blue-400">${expense.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Debt Section */}
              <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection('debt')}
                  className="w-full p-6 flex items-center justify-between hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  <div className="flex items-center justify-between flex-1 mr-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500">credit_card</span>
                      Debt Payments
                    </h3>
                    <span className="text-xl font-black text-red-500">${debts.reduce((sum, d) => sum + d.minimumPayment, 0).toLocaleString()}</span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform ${collapsedSections.debt ? '' : 'rotate-180'}`}>
                    expand_more
                  </span>
                </button>
                {!collapsedSections.debt && (
                  <div className="px-6 pb-6 max-h-80 overflow-y-auto">
                    <div className="space-y-2">
                      {debts.map(debt => (
                        <div key={debt.id} className="flex justify-between items-center p-3 rounded-xl bg-background-light dark:bg-background-dark">
                          <div>
                            <p className="text-sm font-bold">{debt.name}</p>
                            <p className="text-xs text-text-muted">Due: {debt.dueDate}th</p>
                          </div>
                          <span className="text-sm font-black text-red-500">${debt.minimumPayment.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Savings Section */}
              <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden lg:col-span-2">
                <button
                  onClick={() => toggleSection('savings')}
                  className="w-full p-6 flex items-center justify-between hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  <div className="flex items-center justify-between flex-1 mr-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500">savings</span>
                      Savings Goals
                    </h3>
                    <span className="text-xl font-black text-blue-500">${savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0).toLocaleString()}</span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform ${collapsedSections.savings ? '' : 'rotate-180'}`}>
                    expand_more
                  </span>
                </button>
                {!collapsedSections.savings && (
                  <div className="px-6 pb-6 max-h-80 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savingsGoals.map(goal => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100;
                        return (
                          <div key={goal.id} className="p-4 rounded-xl bg-background-light dark:bg-background-dark">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="text-sm font-bold">{goal.name}</p>
                                <p className="text-xs text-text-muted">{progress.toFixed(0)}% Complete</p>
                              </div>
                              <span className="text-sm font-black text-blue-500">${goal.currentAmount.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* One-Time Item Modal */}
            {showOneTimeModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-text-main dark:text-white">
                        Add One-Time {oneTimeItemType.charAt(0).toUpperCase() + oneTimeItemType.slice(1)}
                      </h2>
                      <p className="text-xs text-text-muted mt-1">
                        For {months[selectedMonth]} {selectedYear} only
                      </p>
                    </div>
                    <button
                      onClick={() => setShowOneTimeModal(false)}
                      className="size-10 rounded-xl hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-4">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                        {oneTimeItemType === 'income' ? 'Source' : 'Name'}
                      </label>
                      <input
                        type="text"
                        value={oneTimeForm.name}
                        onChange={(e) => setOneTimeForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main dark:text-white"
                        placeholder={oneTimeItemType === 'income' ? 'e.g., Bonus Payment' : `e.g., ${oneTimeItemType === 'bill' ? 'Car Repair' : oneTimeItemType === 'expense' ? 'Holiday Shopping' : oneTimeItemType === 'subscription' ? 'Annual Software License' : 'Emergency Fund Deposit'}`}
                      />
                    </div>

                    {/* Amount Field */}
                    <div>
                      <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                        <input
                          type="number"
                          value={oneTimeForm.amount || ''}
                          onChange={(e) => setOneTimeForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-8 pr-4 py-2.5 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main dark:text-white"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Date Field */}
                    <div>
                      <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                        Date
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={oneTimeForm.date}
                        onChange={(e) => setOneTimeForm(prev => ({ ...prev, date: parseInt(e.target.value) || 1 }))}
                        className="w-full px-4 py-2.5 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main dark:text-white"
                      />
                    </div>

                    {/* Emoji Picker (for expenses and bills) */}
                    {(oneTimeItemType === 'expense' || oneTimeItemType === 'bill') && (
                      <div>
                        <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                          Icon
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-xl bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center text-2xl">
                            {oneTimeForm.emoji}
                          </div>
                          <div className="flex-1 grid grid-cols-8 gap-2">
                            {['💰', '🛒', '🍕', '⛽', '💊', '🎬', '✈️', '🎁', '🏠', '💡', '🚗', '📱', '👕', '📚', '🎮', '☕'].map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => setOneTimeForm(prev => ({ ...prev, emoji }))}
                                className={`size-10 rounded-lg flex items-center justify-center text-xl transition-all hover:bg-primary/10 ${oneTimeForm.emoji === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'bg-background-light dark:bg-background-dark'}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Description Field */}
                    <div>
                      <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={oneTimeForm.description}
                        onChange={(e) => setOneTimeForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main dark:text-white resize-none"
                        rows={3}
                        placeholder="Add any additional notes..."
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="sticky bottom-0 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
                    <button
                      onClick={() => setShowOneTimeModal(false)}
                      className="flex-1 px-4 py-2.5 bg-background-light dark:bg-background-dark text-text-main dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveOneTimeItem}
                      disabled={!oneTimeForm.name || !oneTimeForm.amount}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl font-bold hover:from-primary/90 hover:to-pink-500/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add {oneTimeItemType.charAt(0).toUpperCase() + oneTimeItemType.slice(1)}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============== OTHER VIEWS ==============
  const CalendarView = () => {
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day;
      return new Date(today.setDate(diff));
    });
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Get days in month
    const getDaysInMonth = (month: number, year: number) => {
      return new Date(year, month + 1, 0).getDate();
    };

    // Get first day of month (0 = Sunday)
    const getFirstDayOfMonth = (month: number, year: number) => {
      return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);

    // Create calendar grid
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }

    // Get items due on a specific day
    const getItemsForDay = (day: number) => {
      const billsOnDay = bills.filter(b => b.dueDate === day);
      const subsOnDay = subscriptions.filter(s => s.dueDate === day);
      const debtsOnDay = debts.filter(d => d.dueDate === day);
      return { bills: billsOnDay, subscriptions: subsOnDay, debts: debtsOnDay };
    };

    const goToPrevMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
      setSelectedDay(null);
    };

    const goToNextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
      setSelectedDay(null);
    };

    const goToPrevWeek = () => {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() - 7);
      setCurrentWeekStart(newWeekStart);
    };

    const goToNextWeek = () => {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() + 7);
      setCurrentWeekStart(newWeekStart);
    };

    const getWeekDays = () => {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStart);
        day.setDate(day.getDate() + i);
        days.push(day);
      }
      return days;
    };

    const selectedDayItems = selectedDay ? getItemsForDay(selectedDay) : null;

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Payment Calendar</h1>
            <p className="text-text-muted mt-0.5 font-medium text-sm">Track bills and subscription due dates</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800 p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'month'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-main dark:hover:text-white'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'week'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-main dark:hover:text-white'
                }`}
              >
                Week
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={viewMode === 'month' ? goToPrevMonth : goToPrevWeek}
                className="size-10 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="min-w-[160px] text-center">
                {viewMode === 'month' ? (
                  <p className="text-lg font-black">{months[currentMonth]} {currentYear}</p>
                ) : (
                  <p className="text-lg font-black">
                    {months[currentWeekStart.getMonth()]} {currentWeekStart.getDate()} - {months[getWeekDays()[6].getMonth()]} {getWeekDays()[6].getDate()}
                  </p>
                )}
              </div>
              <button
                onClick={viewMode === 'month' ? goToNextMonth : goToNextWeek}
                className="size-10 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            {viewMode === 'month' ? (
              <>
                {/* Month View */}
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {daysOfWeek.map(day => (
                    <div key={day} className="text-center text-xs font-black text-text-muted uppercase tracking-wider py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={idx} className="aspect-square"></div>;
                }

                const items = getItemsForDay(day);
                const hasItems = items.bills.length > 0 || items.subscriptions.length > 0 || items.debts.length > 0;
                const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                const isSelected = day === selectedDay;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square rounded-xl border-2 p-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : isToday
                        ? 'border-primary/30 bg-primary/5'
                        : hasItems
                        ? 'border-gray-200 dark:border-gray-700 hover:border-primary/30 bg-background-light dark:bg-background-dark'
                        : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`text-sm font-bold mb-1 ${isToday ? 'text-primary' : 'text-text-main dark:text-white'}`}>
                        {day}
                      </div>
                      {hasItems && (
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {items.bills.length > 0 && (
                            <div className="size-1.5 rounded-full bg-orange-500"></div>
                          )}
                          {items.subscriptions.length > 0 && (
                            <div className="size-1.5 rounded-full bg-purple-500"></div>
                          )}
                          {items.debts.length > 0 && (
                            <div className="size-1.5 rounded-full bg-red-500"></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-orange-500"></div>
                <span className="text-xs font-medium text-text-muted">Bills</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-purple-500"></div>
                <span className="text-xs font-medium text-text-muted">Subscriptions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-500"></div>
                <span className="text-xs font-medium text-text-muted">Debt Payments</span>
              </div>
            </div>
              </>
            ) : (
              <>
                {/* Week View */}
                <div className="space-y-4">
                  {getWeekDays().map((date, idx) => {
                    const day = date.getDate();
                    const month = date.getMonth();
                    const year = date.getFullYear();
                    const items = getItemsForDay(day);
                    const hasItems = items.bills.length > 0 || items.subscriptions.length > 0 || items.debts.length > 0;
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                    const isSelected = day === selectedDay;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDay(day)}
                        className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : isToday
                            ? 'border-primary/30 bg-primary/5'
                            : hasItems
                            ? 'border-gray-200 dark:border-gray-700 hover:border-primary/30 bg-background-light dark:bg-background-dark'
                            : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`text-lg font-black ${isToday ? 'text-primary' : 'text-text-main dark:text-white'}`}>
                              {fullDaysOfWeek[idx]}
                            </h3>
                            <p className="text-sm text-text-muted font-medium">
                              {months[month]} {day}, {year}
                            </p>
                          </div>
                          {hasItems && (
                            <div className="flex gap-2">
                              {items.bills.length > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/30">
                                  <div className="size-2 rounded-full bg-orange-500"></div>
                                  <span className="text-xs font-bold text-orange-700 dark:text-orange-400">{items.bills.length} Bill{items.bills.length > 1 ? 's' : ''}</span>
                                </div>
                              )}
                              {items.subscriptions.length > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                                  <div className="size-2 rounded-full bg-purple-500"></div>
                                  <span className="text-xs font-bold text-purple-700 dark:text-purple-400">{items.subscriptions.length} Sub{items.subscriptions.length > 1 ? 's' : ''}</span>
                                </div>
                              )}
                              {items.debts.length > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/30">
                                  <div className="size-2 rounded-full bg-red-500"></div>
                                  <span className="text-xs font-bold text-red-700 dark:text-red-400">{items.debts.length} Debt{items.debts.length > 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Show items inline for week view */}
                        {hasItems && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                            {items.bills.map(bill => (
                              <div key={bill.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-surface-dark">
                                <span className="text-sm font-bold text-text-main dark:text-white">{bill.name}</span>
                                <span className="text-sm font-black text-orange-600">${bill.amount.toLocaleString()}</span>
                              </div>
                            ))}
                            {items.subscriptions.map(sub => (
                              <div key={sub.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-surface-dark">
                                <span className="text-sm font-bold text-text-main dark:text-white">{sub.name}</span>
                                <span className="text-sm font-black text-purple-600">${sub.amount.toLocaleString()}</span>
                              </div>
                            ))}
                            {items.debts.map(debt => (
                              <div key={debt.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-surface-dark">
                                <span className="text-sm font-bold text-text-main dark:text-white">{debt.name}</span>
                                <span className="text-sm font-black text-red-600">${debt.minimumPayment.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Details Panel */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold mb-4">
              {selectedDay ? `${months[currentMonth]} ${selectedDay}` : 'Select a Day'}
            </h3>

            {selectedDay && selectedDayItems ? (
              <div className="space-y-4">
                {/* Bills */}
                {selectedDayItems.bills.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Bills</p>
                    <div className="space-y-2">
                      {selectedDayItems.bills.map(bill => (
                        <div key={bill.id} className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-bold text-text-main dark:text-white">{bill.name}</p>
                            <span className="text-sm font-black text-orange-600 dark:text-orange-400">${bill.amount}</span>
                          </div>
                          <p className="text-xs text-text-muted">{bill.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscriptions */}
                {selectedDayItems.subscriptions.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Subscriptions</p>
                    <div className="space-y-2">
                      {selectedDayItems.subscriptions.map(sub => (
                        <div key={sub.id} className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-bold text-text-main dark:text-white">{sub.name}</p>
                            <span className="text-sm font-black text-purple-600 dark:text-purple-400">${sub.amount}</span>
                          </div>
                          <p className="text-xs text-text-muted capitalize">{sub.frequency}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Debt Payments */}
                {selectedDayItems.debts.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Debt Payments</p>
                    <div className="space-y-2">
                      {selectedDayItems.debts.map(debt => (
                        <div key={debt.id} className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-bold text-text-main dark:text-white">{debt.name}</p>
                            <span className="text-sm font-black text-red-600 dark:text-red-400">${debt.minimumPayment}</span>
                          </div>
                          <p className="text-xs text-text-muted">Minimum Payment</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total for the day */}
                {(selectedDayItems.bills.length > 0 || selectedDayItems.subscriptions.length > 0 || selectedDayItems.debts.length > 0) && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-text-muted">Total Due</span>
                      <span className="text-lg font-black text-primary">
                        ${(
                          selectedDayItems.bills.reduce((sum, b) => sum + b.amount, 0) +
                          selectedDayItems.subscriptions.reduce((sum, s) => sum + s.amount, 0) +
                          selectedDayItems.debts.reduce((sum, d) => sum + d.minimumPayment, 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Click on a date to view payment details</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TransactionsView = () => {
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    // Extended mock transactions
    const allTransactions: Transaction[] = [
      ...transactions,
      { id: 't4', date: '2024-10-20', description: 'Primary Job Salary', category: 'Income', amount: 5000, type: 'income' },
      { id: 't5', date: '2024-10-18', description: 'Restaurant', category: 'Food', amount: -65.20, type: 'expense' },
      { id: 't6', date: '2024-10-16', description: 'Netflix Subscription', category: 'Entertainment', amount: -15.99, type: 'expense' },
      { id: 't7', date: '2024-10-15', description: 'Electric Bill', category: 'Utilities', amount: -120, type: 'expense' },
      { id: 't8', date: '2024-10-12', description: 'Spotify Subscription', category: 'Entertainment', amount: -9.99, type: 'expense' },
      { id: 't9', date: '2024-10-10', description: 'Internet Bill', category: 'Utilities', amount: -80, type: 'expense' },
      { id: 't10', date: '2024-10-08', description: 'Freelance Project', category: 'Income', amount: 1500, type: 'income' },
      { id: 't11', date: '2024-10-05', description: 'Car Insurance', category: 'Insurance', amount: -150, type: 'expense' },
      { id: 't12', date: '2024-10-01', description: 'Rent Payment', category: 'Housing', amount: -1800, type: 'expense' },
    ];

    // Filter transactions
    const filteredTransactions = allTransactions
      .filter(t => {
        if (filter === 'all') return true;
        return t.type === filter;
      })
      .filter(t => {
        if (!searchTerm) return true;
        return t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               t.category.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate totals
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = Math.abs(filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0));

    const netAmount = totalIncome - totalExpenses;

    // Get category breakdown
    const categoryTotals = filteredTransactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Transactions</h1>
            <p className="text-text-muted mt-0.5 font-medium text-sm">View and manage all your transactions</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-muted text-[20px]">search</span>
              </div>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm"
              />
            </div>
            {/* Add Transaction Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all text-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add
            </button>
          </div>
        </div>

        {/* Add/Edit Transaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-main dark:text-white">
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTransaction(null);
                  }}
                  className="text-text-muted hover:text-text-main"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">Type</label>
                  <div className="flex gap-2">
                    <button type="button" className="flex-1 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      Income
                    </button>
                    <button type="button" className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-muted font-bold text-sm">
                      Expense
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">Description</label>
                  <input
                    type="text"
                    placeholder="e.g., Grocery Shopping"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-background-dark text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-background-dark text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">Category</label>
                  <select className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-background-dark text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                    <option>Food</option>
                    <option>Transportation</option>
                    <option>Entertainment</option>
                    <option>Utilities</option>
                    <option>Housing</option>
                    <option>Income</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-background-dark text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingTransaction(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all"
                  >
                    {editingTransaction ? 'Save Changes' : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Total Income</p>
            <p className="text-2xl font-black">${totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Total Expenses</p>
            <p className="text-2xl font-black">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className={`bg-gradient-to-br ${netAmount >= 0 ? 'from-blue-500 to-cyan-500' : 'from-orange-500 to-red-500'} text-white rounded-2xl p-5 shadow-lg`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Net Amount</p>
            <p className="text-2xl font-black">{netAmount >= 0 ? '+' : '-'}${Math.abs(netAmount).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions List */}
          <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 bg-background-light dark:bg-background-dark rounded-xl p-1">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('income')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setFilter('expense')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Expenses
              </button>
            </div>

            {/* Transaction Items */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-background-light dark:bg-background-dark hover:bg-primary/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`size-10 rounded-xl flex items-center justify-center ${
                        tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-950/30' : 'bg-rose-100 dark:bg-rose-950/30'
                      }`}>
                        <span className={`material-symbols-outlined text-[20px] ${
                          tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {tx.type === 'income' ? 'trending_up' : 'trending_down'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main dark:text-white">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-text-muted">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-xs text-text-muted">•</span>
                          <span className="text-xs font-medium text-text-muted">{tx.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-black ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-text-muted/30 mb-4">receipt_long</span>
                  <p className="text-text-muted">No transactions found</p>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Top Categories</h3>
            <div className="space-y-3">
              {topCategories.length > 0 ? (
                topCategories.map(([category, amount], idx) => {
                  const maxAmount = topCategories[0][1];
                  const percentage = (amount / maxAmount) * 100;

                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-text-main dark:text-white">{category}</span>
                        <span className="text-sm font-black text-primary">${amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-text-muted">No categories to display</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-text-muted">Total Transactions</span>
                <span className="text-sm font-bold text-text-main dark:text-white">{filteredTransactions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-text-muted">Avg Transaction</span>
                <span className="text-sm font-bold text-text-main dark:text-white">
                  ${filteredTransactions.length > 0
                    ? Math.abs(filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length).toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SavingsView = () => {
    // Savings Goal Modal State
    const [showSavingsModal, setShowSavingsModal] = useState(false);
    const [editingSavingsGoal, setEditingSavingsGoal] = useState<SavingsGoal | null>(null);
    const [savingsForm, setSavingsForm] = useState({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: ''
    });

    const handleAddSavingsGoal = () => {
      setEditingSavingsGoal(null);
      setSavingsForm({
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: ''
      });
      setShowSavingsModal(true);
    };

    const handleEditSavingsGoal = (goal: SavingsGoal) => {
      setEditingSavingsGoal(goal);
      setSavingsForm({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline
      });
      setShowSavingsModal(true);
    };

    const handleDeleteSavingsGoal = (id: string) => {
      if (confirm('Are you sure you want to delete this savings goal?')) {
        // TODO: Implement delete functionality
        console.log('Delete savings goal:', id);
      }
    };

    const handleSaveSavingsGoal = () => {
      if (!savingsForm.name || savingsForm.targetAmount <= 0 || !savingsForm.deadline) {
        alert('Please fill in all required fields');
        return;
      }
      // TODO: Implement save functionality
      console.log('Save savings goal:', savingsForm);
      setShowSavingsModal(false);
    };

    // Extended mock savings goals
    const allSavingsGoals: SavingsGoal[] = [
      ...savingsGoals,
      { id: 'sg3', name: 'New Car Down Payment', targetAmount: 15000, currentAmount: 8200, deadline: '2025-03-01' },
      { id: 'sg4', name: 'House Renovation', targetAmount: 30000, currentAmount: 12500, deadline: '2025-09-15' },
    ];

    // Calculate total savings
    const totalSaved = allSavingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalTarget = allSavingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalRemaining = totalTarget - totalSaved;
    const overallProgress = (totalSaved / totalTarget) * 100;

    // Helper function to determine if goal is on track
    const getGoalStatus = (goal: SavingsGoal) => {
      const daysUntilDeadline = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const progress = (goal.currentAmount / goal.targetAmount) * 100;

      if (progress >= 100) return { status: 'completed', color: 'emerald', text: 'Completed!' };
      if (daysUntilDeadline < 0) return { status: 'overdue', color: 'red', text: 'Overdue' };
      if (progress >= 75) return { status: 'on-track', color: 'blue', text: 'On Track' };
      if (progress >= 50) return { status: 'moderate', color: 'yellow', text: 'Making Progress' };
      return { status: 'behind', color: 'orange', text: 'Needs Attention' };
    };

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Savings Goals</h1>
            <p className="text-text-muted mt-0.5 font-medium text-sm">Track and manage your savings goals</p>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Total Saved</p>
            <p className="text-2xl font-black">${totalSaved.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Total Target</p>
            <p className="text-2xl font-black">${totalTarget.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Remaining</p>
            <p className="text-2xl font-black">${totalRemaining.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Overall Progress</p>
            <p className="text-2xl font-black">{overallProgress.toFixed(0)}%</p>
          </div>
        </div>

        {/* Savings Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {allSavingsGoals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;
            const status = getGoalStatus(goal);
            const daysUntilDeadline = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div key={goal.id} className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text-main dark:text-white mb-1">{goal.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-${status.color}-100 dark:bg-${status.color}-950/30 text-${status.color}-700 dark:text-${status.color}-400`}>
                      {status.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditSavingsGoal(goal)}
                      className="size-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 hover:bg-blue-200 dark:hover:bg-blue-900/40 flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSavingsGoal(goal.id)}
                      className="size-10 rounded-xl bg-red-100 dark:bg-red-950/30 hover:bg-red-200 dark:hover:bg-red-900/40 flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[20px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-medium text-text-muted">Progress</span>
                    <span className="text-sm font-black text-primary">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-background-light dark:bg-background-dark rounded-xl p-3">
                    <p className="text-xs font-medium text-text-muted mb-1">Current</p>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">${goal.currentAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-background-light dark:bg-background-dark rounded-xl p-3">
                    <p className="text-xs font-medium text-text-muted mb-1">Target</p>
                    <p className="text-lg font-black text-text-main dark:text-white">${goal.targetAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-text-muted">Remaining</span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">${remaining.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-text-muted">Deadline</span>
                    <span className="text-sm font-bold text-text-main dark:text-white">
                      {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-text-muted">Days Left</span>
                    <span className={`text-sm font-bold ${daysUntilDeadline < 30 ? 'text-red-600 dark:text-red-400' : 'text-text-main dark:text-white'}`}>
                      {daysUntilDeadline > 0 ? `${daysUntilDeadline} days` : 'Overdue'}
                    </span>
                  </div>
                  {daysUntilDeadline > 0 && remaining > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-medium text-text-muted">Needed per month</span>
                      <span className="text-sm font-bold text-primary">
                        ${Math.ceil(remaining / (daysUntilDeadline / 30)).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Goal Button */}
        <div className="flex justify-center">
          <button
            onClick={handleAddSavingsGoal}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Add New Savings Goal
          </button>
        </div>

        {/* Savings Goal Modal */}
        {showSavingsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-text-main dark:text-white">
                    {editingSavingsGoal ? 'Edit Savings Goal' : 'Add New Savings Goal'}
                  </h2>
                  <button
                    onClick={() => setShowSavingsModal(false)}
                    className="size-9 rounded-xl bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px] text-text-muted">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Goal Name */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Goal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={savingsForm.name}
                    onChange={(e) => setSavingsForm({ ...savingsForm, name: e.target.value })}
                    placeholder="e.g., Emergency Fund, Vacation, New Car"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Target Amount */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Target Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                      <input
                        type="number"
                        value={savingsForm.targetAmount || ''}
                        onChange={(e) => setSavingsForm({ ...savingsForm, targetAmount: parseFloat(e.target.value) || 0 })}
                        placeholder="10000"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1.5">Your savings goal</p>
                  </div>

                  {/* Current Amount */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Current Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                      <input
                        type="number"
                        value={savingsForm.currentAmount || ''}
                        onChange={(e) => setSavingsForm({ ...savingsForm, currentAmount: parseFloat(e.target.value) || 0 })}
                        placeholder="2500"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1.5">Amount already saved</p>
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Target Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={savingsForm.deadline}
                    onChange={(e) => setSavingsForm({ ...savingsForm, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  <p className="text-xs text-text-muted mt-1.5">When do you want to reach this goal?</p>
                </div>

                {/* Preview Calculation */}
                {savingsForm.targetAmount > 0 && savingsForm.deadline && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-900/30">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">calculate</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-text-main dark:text-white mb-2">Monthly Savings Needed</p>
                        {(() => {
                          const daysUntilDeadline = Math.ceil((new Date(savingsForm.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          const monthsUntilDeadline = Math.max(1, Math.ceil(daysUntilDeadline / 30));
                          const remaining = savingsForm.targetAmount - savingsForm.currentAmount;
                          const monthlyNeeded = Math.ceil(remaining / monthsUntilDeadline);
                          return (
                            <p className="text-2xl font-black text-primary">
                              ${monthlyNeeded.toLocaleString()}<span className="text-sm font-medium text-text-muted">/month</span>
                            </p>
                          );
                        })()}
                        <p className="text-xs text-text-muted mt-1">Based on your target date and current savings</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                <button
                  onClick={() => setShowSavingsModal(false)}
                  className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark text-text-main dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSavingsGoal}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30"
                >
                  {editingSavingsGoal ? 'Update Goal' : 'Add Goal'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const DebtView = () => {
    // Debt Modal State
    const [showDebtModal, setShowDebtModal] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [debtForm, setDebtForm] = useState({
      name: '',
      totalAmount: 0,
      remainingAmount: 0,
      interestRate: 0,
      minimumPayment: 0,
      dueDate: 1
    });

    const handleAddDebt = () => {
      setEditingDebt(null);
      setDebtForm({
        name: '',
        totalAmount: 0,
        remainingAmount: 0,
        interestRate: 0,
        minimumPayment: 0,
        dueDate: 1
      });
      setShowDebtModal(true);
    };

    const handleEditDebt = (debt: Debt) => {
      setEditingDebt(debt);
      setDebtForm({
        name: debt.name,
        totalAmount: debt.totalAmount,
        remainingAmount: debt.remainingAmount,
        interestRate: debt.interestRate,
        minimumPayment: debt.minimumPayment,
        dueDate: debt.dueDate
      });
      setShowDebtModal(true);
    };

    const handleDeleteDebt = (id: string) => {
      if (confirm('Are you sure you want to delete this debt?')) {
        // TODO: Implement delete functionality
        console.log('Delete debt:', id);
      }
    };

    const handleSaveDebt = () => {
      if (!debtForm.name || debtForm.totalAmount <= 0 || debtForm.minimumPayment <= 0) {
        alert('Please fill in all required fields');
        return;
      }
      // TODO: Implement save functionality
      console.log('Save debt:', debtForm);
      setShowDebtModal(false);
    };

    // Extended mock debts
    const allDebts: Debt[] = [
      ...debts,
      { id: 'd3', name: 'Car Loan', totalAmount: 18000, remainingAmount: 12000, interestRate: 5.9, minimumPayment: 350, dueDate: 10 },
    ];

    // Calculate totals
    const totalDebt = allDebts.reduce((sum, debt) => sum + debt.totalAmount, 0);
    const totalRemaining = allDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    const totalPaid = totalDebt - totalRemaining;
    const totalMonthlyPayment = allDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const overallProgress = (totalPaid / totalDebt) * 100;

    // Helper: Calculate estimated months to payoff
    const getMonthsToPayoff = (debt: Debt) => {
      if (debt.remainingAmount <= 0) return 0;
      const monthlyRate = debt.interestRate / 100 / 12;
      if (monthlyRate === 0) return Math.ceil(debt.remainingAmount / debt.minimumPayment);

      // Using loan payoff formula
      const months = Math.ceil(
        Math.log(debt.minimumPayment / (debt.minimumPayment - debt.remainingAmount * monthlyRate)) /
        Math.log(1 + monthlyRate)
      );
      return isNaN(months) || months < 0 ? 0 : months;
    };

    // Helper: Calculate total interest to be paid
    const getTotalInterest = (debt: Debt) => {
      const months = getMonthsToPayoff(debt);
      const totalPayment = debt.minimumPayment * months;
      return Math.max(0, totalPayment - debt.remainingAmount);
    };

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Debt Management</h1>
            <p className="text-text-muted mt-0.5 font-medium text-sm">Track and manage your debt repayment</p>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-500 to-rose-500 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Total Remaining</p>
            <p className="text-2xl font-black">${totalRemaining.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Total Paid Off</p>
            <p className="text-2xl font-black">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Monthly Payment</p>
            <p className="text-2xl font-black">${totalMonthlyPayment.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Paid Off</p>
            <p className="text-2xl font-black">{overallProgress.toFixed(0)}%</p>
          </div>
        </div>

        {/* Debt Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {allDebts.map(debt => {
            const progress = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100;
            const monthsToPayoff = getMonthsToPayoff(debt);
            const totalInterest = getTotalInterest(debt);
            const payoffDate = new Date();
            payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff);

            return (
              <div key={debt.id} className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text-main dark:text-white mb-1">{debt.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400">
                        {debt.interestRate}% APR
                      </span>
                      <span className="text-xs text-text-muted">Due: {debt.dueDate}th</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditDebt(debt)}
                      className="size-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 hover:bg-blue-200 dark:hover:bg-blue-900/40 flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDebt(debt.id)}
                      className="size-10 rounded-xl bg-red-100 dark:bg-red-950/30 hover:bg-red-200 dark:hover:bg-red-900/40 flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[20px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-medium text-text-muted">Paid Off</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-background-light dark:bg-background-dark rounded-xl p-3">
                    <p className="text-xs font-medium text-text-muted mb-1">Total</p>
                    <p className="text-base font-black text-text-main dark:text-white">${debt.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-background-light dark:bg-background-dark rounded-xl p-3">
                    <p className="text-xs font-medium text-text-muted mb-1">Remaining</p>
                    <p className="text-base font-black text-red-600 dark:text-red-400">${debt.remainingAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-background-light dark:bg-background-dark rounded-xl p-3">
                    <p className="text-xs font-medium text-text-muted mb-1">Paid</p>
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400">${(debt.totalAmount - debt.remainingAmount).toLocaleString()}</p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-text-muted">Minimum Payment</span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">${debt.minimumPayment.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-text-muted">Months to Payoff</span>
                    <span className="text-sm font-bold text-text-main dark:text-white">
                      {monthsToPayoff > 0 ? `${monthsToPayoff} months` : 'Paid Off'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-text-muted">Est. Payoff Date</span>
                    <span className="text-sm font-bold text-text-main dark:text-white">
                      {monthsToPayoff > 0
                        ? payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : 'Complete'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-medium text-text-muted">Total Interest</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      ${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payoff Strategy Tips */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900/30">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">lightbulb</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">Payoff Strategies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-bold text-text-main dark:text-white mb-2">❄️ Avalanche Method</p>
                  <p className="text-xs text-text-muted">Focus on highest interest rate first. Saves most money on interest.</p>
                  <p className="text-xs font-bold text-primary mt-2">
                    Target: {allDebts.sort((a, b) => b.interestRate - a.interestRate)[0]?.name} ({allDebts.sort((a, b) => b.interestRate - a.interestRate)[0]?.interestRate}% APR)
                  </p>
                </div>
                <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-bold text-text-main dark:text-white mb-2">⚡ Snowball Method</p>
                  <p className="text-xs text-text-muted">Pay off smallest balance first. Builds momentum and motivation.</p>
                  <p className="text-xs font-bold text-primary mt-2">
                    Target: {allDebts.sort((a, b) => a.remainingAmount - b.remainingAmount)[0]?.name} (${allDebts.sort((a, b) => a.remainingAmount - b.remainingAmount)[0]?.remainingAmount.toLocaleString()})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Debt Button */}
        <div className="flex justify-center">
          <button
            onClick={handleAddDebt}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Add New Debt
          </button>
        </div>

        {/* Debt Modal */}
        {showDebtModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-text-main dark:text-white">
                    {editingDebt ? 'Edit Debt' : 'Add New Debt'}
                  </h2>
                  <button
                    onClick={() => setShowDebtModal(false)}
                    className="size-9 rounded-xl bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px] text-text-muted">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Debt Name */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Debt Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={debtForm.name}
                    onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })}
                    placeholder="e.g., Student Loan, Credit Card, Car Loan"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Total Amount */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Total Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                      <input
                        type="number"
                        value={debtForm.totalAmount || ''}
                        onChange={(e) => setDebtForm({ ...debtForm, totalAmount: parseFloat(e.target.value) || 0 })}
                        placeholder="25000"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1.5">Original loan/debt amount</p>
                  </div>

                  {/* Remaining Amount */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Remaining Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                      <input
                        type="number"
                        value={debtForm.remainingAmount || ''}
                        onChange={(e) => setDebtForm({ ...debtForm, remainingAmount: parseFloat(e.target.value) || 0 })}
                        placeholder="18000"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1.5">Current balance owed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Interest Rate <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={debtForm.interestRate || ''}
                        onChange={(e) => setDebtForm({ ...debtForm, interestRate: parseFloat(e.target.value) || 0 })}
                        placeholder="4.5"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">%</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1.5">APR</p>
                  </div>

                  {/* Minimum Payment */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Min. Payment <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                      <input
                        type="number"
                        value={debtForm.minimumPayment || ''}
                        onChange={(e) => setDebtForm({ ...debtForm, minimumPayment: parseFloat(e.target.value) || 0 })}
                        placeholder="250"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1.5">Monthly</p>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={debtForm.dueDate}
                      onChange={(e) => setDebtForm({ ...debtForm, dueDate: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>
                          {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-muted mt-1.5">Day of month</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                <button
                  onClick={() => setShowDebtModal(false)}
                  className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark text-text-main dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDebt}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/30"
                >
                  {editingDebt ? 'Update Debt' : 'Add Debt'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============== DASHBOARD VIEW (NEW - Visual Analytics) ==============
  const DashboardView = () => {
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Calculate spending by category for donut chart
    const expensesByCategory = [
      { category: 'Housing', amount: 1800, color: 'bg-blue-500', percentage: 45 },
      { category: 'Food', amount: 600, color: 'bg-emerald-500', percentage: 15 },
      { category: 'Utilities', amount: 400, color: 'bg-orange-500', percentage: 10 },
      { category: 'Entertainment', amount: 200, color: 'bg-purple-500', percentage: 5 },
      { category: 'Transportation', amount: 300, color: 'bg-pink-500', percentage: 7.5 },
      { category: 'Other', amount: 700, color: 'bg-gray-500', percentage: 17.5 },
    ];

    // 6-month trend data
    const trendData = [
      { month: 'May', income: 6500, expenses: 4200 },
      { month: 'Jun', income: 6500, expenses: 4500 },
      { month: 'Jul', income: 7000, expenses: 4100 },
      { month: 'Aug', income: 6500, expenses: 4800 },
      { month: 'Sep', income: 6500, expenses: 4400 },
      { month: 'Oct', income: 6500, expenses: 4000 },
    ];

    // Upcoming bills (next 7 days)
    const upcomingBills = [
      { name: 'Rent', amount: 1800, dueDate: '1st', daysUntil: 2, color: 'blue' },
      { name: 'Car Insurance', amount: 150, dueDate: '5th', daysUntil: 6, color: 'orange' },
      { name: 'Internet', amount: 80, dueDate: '10th', daysUntil: 11, color: 'purple' },
    ].filter(bill => bill.daysUntil <= 7);

    // Budget remaining gauge
    const budgetUsed = (monthlyExpenses / monthlyIncome) * 100;
    const budgetRemaining = 100 - budgetUsed;

    // AI Insights
    const insights = [
      { icon: 'trending_down', text: 'You\'re spending 12% less than last month. Great job!', type: 'positive' },
      { icon: 'warning', text: 'Housing costs are 45% of income. Consider budgeting adjustments.', type: 'warning' },
      { icon: 'lightbulb', text: 'You could save $200/month by reducing entertainment expenses.', type: 'tip' },
    ];

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Financial Dashboard</h1>
          <p className="text-text-muted mt-0.5 font-medium text-sm">Visual analytics and insights for {currentMonth}</p>
        </div>

        {/* Current Month Snapshot */}
        <div className="bg-gradient-to-br from-primary to-pink-500 text-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4 opacity-90">Current Month Snapshot</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs opacity-80 mb-1">Total Income</p>
              <p className="text-2xl font-black">${monthlyIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs opacity-80 mb-1">Total Expenses</p>
              <p className="text-2xl font-black">${monthlyExpenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs opacity-80 mb-1">Left to Spend</p>
              <p className="text-2xl font-black">${leftToSpend.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs opacity-80 mb-1">Budget Status</p>
              <p className="text-2xl font-black">{budgetRemaining.toFixed(0)}% Left</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income vs Expenses Bar Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-main dark:text-white">6-Month Trend</h3>
              <button className="text-xs font-bold text-primary hover:underline">View Details →</button>
            </div>

            {/* Line Chart */}
            <div className="space-y-4">
              <div className="h-48 flex items-end justify-between gap-4">
                {trendData.map((data, idx) => {
                  const maxValue = 8000;
                  const incomeHeight = (data.income / maxValue) * 100;
                  const expenseHeight = (data.expenses / maxValue) * 100;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex justify-center gap-1 items-end h-40">
                        <div className="relative group flex-1">
                          <div
                            className="w-full bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600 cursor-pointer"
                            style={{ height: `${incomeHeight}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              ${data.income}
                            </div>
                          </div>
                        </div>
                        <div className="relative group flex-1">
                          <div
                            className="w-full bg-rose-500 rounded-t-lg transition-all hover:bg-rose-600 cursor-pointer"
                            style={{ height: `${expenseHeight}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              ${data.expenses}
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-text-muted">{data.month}</span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded bg-emerald-500"></div>
                  <span className="text-xs font-bold text-text-muted">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded bg-rose-500"></div>
                  <span className="text-xs font-bold text-text-muted">Expenses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Remaining Gauge */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-text-main dark:text-white mb-6">Budget Remaining</h3>

            {/* Circular Progress */}
            <div className="flex flex-col items-center">
              <div className="relative size-40">
                <svg className="transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-gray-100 dark:text-gray-800"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={`${budgetRemaining * 3.14} ${100 * 3.14}`}
                    className={budgetRemaining > 50 ? 'text-emerald-500' : budgetRemaining > 25 ? 'text-orange-500' : 'text-red-500'}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-text-main dark:text-white">{budgetRemaining.toFixed(0)}%</span>
                  <span className="text-xs text-text-muted font-bold">Available</span>
                </div>
              </div>

              <div className="mt-6 w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted font-medium">Used</span>
                  <span className="font-bold text-text-main dark:text-white">${monthlyExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted font-medium">Remaining</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">${leftToSpend.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Categories Donut Chart */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-main dark:text-white">Spending by Category</h3>
              <button className="text-xs font-bold text-primary hover:underline">View All →</button>
            </div>

            <div className="space-y-3">
              {expensesByCategory.map((item, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`size-3 rounded ${item.color}`}></div>
                      <span className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">{item.category}</span>
                    </div>
                    <span className="text-sm font-bold text-text-main dark:text-white">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all group-hover:opacity-80`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-xs font-bold text-text-muted">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Bills & Subscriptions */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-main dark:text-white">Upcoming Bills</h3>
              <button className="text-xs font-bold text-primary hover:underline">View Calendar →</button>
            </div>

            <div className="space-y-3">
              {upcomingBills.map((bill, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-background-light dark:bg-background-dark hover:bg-primary/5 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl bg-${bill.color}-100 dark:bg-${bill.color}-950/30 flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-${bill.color}-600 dark:text-${bill.color}-400`}>receipt</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">{bill.name}</p>
                      <p className="text-xs text-text-muted">Due {bill.dueDate} • {bill.daysUntil} days</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-text-main dark:text-white">${bill.amount}</span>
                </div>
              ))}

              {upcomingBills.length === 0 && (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-text-muted/30 mb-2">check_circle</span>
                  <p className="text-sm text-text-muted">No bills due in the next 7 days</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Savings & Debt Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Savings Progress */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-main dark:text-white">Savings Goals Progress</h3>
              <button className="text-xs font-bold text-primary hover:underline">View All →</button>
            </div>

            <div className="space-y-4">
              {savingsGoals.slice(0, 3).map(goal => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <div key={goal.id} className="cursor-pointer group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">{goal.name}</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-text-muted">${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Debt Progress */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-main dark:text-white">Debt Payoff Progress</h3>
              <button className="text-xs font-bold text-primary hover:underline">View All →</button>
            </div>

            <div className="space-y-4">
              {debts.slice(0, 3).map(debt => {
                const progress = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100;
                return (
                  <div key={debt.id} className="cursor-pointer group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">{debt.name}</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-text-muted">${debt.remainingAmount.toLocaleString()} remaining</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Insights Widget */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">psychology</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-main dark:text-white">AI Financial Insights</h3>
              <p className="text-xs text-text-muted">Personalized recommendations based on your spending</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 ${
                  insight.type === 'positive'
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30'
                    : insight.type === 'warning'
                    ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30'
                    : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`material-symbols-outlined text-xl ${
                      insight.type === 'positive'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : insight.type === 'warning'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {insight.icon}
                  </span>
                  <p className="text-xs text-text-main dark:text-white leading-relaxed">{insight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============== SETTINGS VIEW ==============
  const SettingsView = () => {
    const [activeTab, setActiveTab] = useState<'income' | 'bills' | 'subscriptions' | 'expenses'>('income');

    // Income Modal State
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);
    const [incomeForm, setIncomeForm] = useState({
      source: '',
      amount: 0,
      frequency: 'weekly' as 'weekly' | 'bi-weekly' | 'monthly' | 'yearly',
      payDay: 'Monday'
    });

    const handleAddIncome = () => {
      setEditingIncome(null);
      setIncomeForm({ source: '', amount: 0, frequency: 'weekly', payDay: 'Monday' });
      setShowIncomeModal(true);
    };

    const handleEditIncome = (income: Income) => {
      setEditingIncome(income);
      setIncomeForm({
        source: income.source,
        amount: income.amount,
        frequency: income.frequency,
        payDay: income.payDay || 'Monday'
      });
      setShowIncomeModal(true);
    };

    const handleDeleteIncome = (id: string) => {
      if (confirm('Are you sure you want to delete this income source?')) {
        setIncomes(incomes.filter(income => income.id !== id));
      }
    };

    const handleSaveIncome = () => {
      if (!incomeForm.source || incomeForm.amount <= 0) {
        alert('Please fill in all required fields');
        return;
      }

      if (editingIncome) {
        // Update existing income
        setIncomes(incomes.map(income =>
          income.id === editingIncome.id
            ? { ...income, ...incomeForm }
            : income
        ));
      } else {
        // Add new income
        const newIncome: Income = {
          id: `i${Date.now()}`,
          ...incomeForm
        };
        setIncomes([...incomes, newIncome]);
      }

      setShowIncomeModal(false);
    };

    // Bill Types with Emojis
    const billTypes = [
      { id: 'housing', label: 'Rent/Mortgage', emoji: '🏠', category: 'Housing' },
      { id: 'electric', label: 'Electric', emoji: '⚡', category: 'Utilities' },
      { id: 'water', label: 'Water', emoji: '💧', category: 'Utilities' },
      { id: 'gas', label: 'Gas', emoji: '🔥', category: 'Utilities' },
      { id: 'internet', label: 'Internet', emoji: '🌐', category: 'Utilities' },
      { id: 'phone', label: 'Phone', emoji: '📱', category: 'Utilities' },
      { id: 'trash', label: 'Trash/Recycling', emoji: '🗑️', category: 'Utilities' },
      { id: 'car-insurance', label: 'Car Insurance', emoji: '🚗', category: 'Insurance' },
      { id: 'health-insurance', label: 'Health Insurance', emoji: '🏥', category: 'Insurance' },
      { id: 'home-insurance', label: 'Home Insurance', emoji: '🏡', category: 'Insurance' },
      { id: 'life-insurance', label: 'Life Insurance', emoji: '❤️', category: 'Insurance' },
      { id: 'loan', label: 'Loan Payment', emoji: '💰', category: 'Loans' },
      { id: 'credit-card', label: 'Credit Card', emoji: '💳', category: 'Loans' },
      { id: 'hoa', label: 'HOA Fees', emoji: '🏘️', category: 'Housing' },
      { id: 'property-tax', label: 'Property Tax', emoji: '🏛️', category: 'Taxes' },
      { id: 'other', label: 'Other', emoji: '📋', category: 'Other' },
    ];

    // Bills Modal State
    const [showBillModal, setShowBillModal] = useState(false);
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [billForm, setBillForm] = useState({
      name: '',
      billType: 'electric',
      amount: 0,
      dueDate: 1,
      frequency: 'monthly' as 'monthly' | 'yearly',
      category: 'Utilities'
    });

    const handleAddBill = () => {
      setEditingBill(null);
      setBillForm({ name: '', billType: 'electric', amount: 0, dueDate: 1, frequency: 'monthly', category: 'Utilities' });
      setShowBillModal(true);
    };

    const handleEditBill = (bill: Bill) => {
      setEditingBill(bill);
      // Find the bill type based on the bill name or category
      const matchedType = billTypes.find(t => t.label === bill.name || t.category === bill.category);
      setBillForm({
        name: bill.name,
        billType: matchedType?.id || 'other',
        amount: bill.amount,
        dueDate: bill.dueDate,
        frequency: bill.frequency,
        category: bill.category
      });
      setShowBillModal(true);
    };

    const handleDeleteBill = (id: string) => {
      if (confirm('Are you sure you want to delete this bill?')) {
        setBills(bills.filter(bill => bill.id !== id));
      }
    };

    const handleSaveBill = () => {
      if (!billForm.name || billForm.amount <= 0) {
        alert('Please fill in all required fields');
        return;
      }

      const billData = {
        name: billForm.name,
        amount: billForm.amount,
        dueDate: billForm.dueDate,
        frequency: billForm.frequency,
        category: billForm.category
      };

      if (editingBill) {
        // Update existing bill
        setBills(bills.map(bill =>
          bill.id === editingBill.id
            ? { ...bill, ...billData }
            : bill
        ));
      } else {
        // Add new bill
        const newBill: Bill = {
          id: `b${Date.now()}`,
          ...billData
        };
        setBills([...bills, newBill]);
      }

      setShowBillModal(false);
    };

    const handleBillTypeChange = (typeId: string) => {
      const selectedType = billTypes.find(t => t.id === typeId);
      if (selectedType) {
        setBillForm({
          ...billForm,
          billType: typeId,
          name: selectedType.label,
          category: selectedType.category
        });
      }
    };

    // Subscription Services with Company Logos
    const subscriptionServices = [
      { id: 'netflix', name: 'Netflix', logo: 'https://logo.clearbit.com/netflix.com', fallbackIcon: '🎬', category: 'Streaming' },
      { id: 'spotify', name: 'Spotify', logo: 'https://logo.clearbit.com/spotify.com', fallbackIcon: '🎵', category: 'Music' },
      { id: 'apple-music', name: 'Apple Music', logo: 'https://logo.clearbit.com/apple.com', fallbackIcon: '🎧', category: 'Music' },
      { id: 'youtube-premium', name: 'YouTube Premium', logo: 'https://logo.clearbit.com/youtube.com', fallbackIcon: '▶️', category: 'Streaming' },
      { id: 'disney-plus', name: 'Disney+', logo: 'https://logo.clearbit.com/disneyplus.com', fallbackIcon: '🏰', category: 'Streaming' },
      { id: 'hulu', name: 'Hulu', logo: 'https://logo.clearbit.com/hulu.com', fallbackIcon: '📺', category: 'Streaming' },
      { id: 'hbo-max', name: 'HBO Max', logo: 'https://logo.clearbit.com/hbomax.com', fallbackIcon: '🎭', category: 'Streaming' },
      { id: 'amazon-prime', name: 'Amazon Prime', logo: 'https://logo.clearbit.com/amazon.com', fallbackIcon: '📦', category: 'Streaming' },
      { id: 'apple-tv', name: 'Apple TV+', logo: 'https://logo.clearbit.com/apple.com', fallbackIcon: '🍎', category: 'Streaming' },
      { id: 'paramount', name: 'Paramount+', logo: 'https://logo.clearbit.com/paramountplus.com', fallbackIcon: '⭐', category: 'Streaming' },
      { id: 'peacock', name: 'Peacock', logo: 'https://logo.clearbit.com/peacocktv.com', fallbackIcon: '🦚', category: 'Streaming' },
      { id: 'adobe', name: 'Adobe Creative Cloud', logo: 'https://logo.clearbit.com/adobe.com', fallbackIcon: '🎨', category: 'Software' },
      { id: 'microsoft-365', name: 'Microsoft 365', logo: 'https://logo.clearbit.com/microsoft.com', fallbackIcon: '💼', category: 'Software' },
      { id: 'dropbox', name: 'Dropbox', logo: 'https://logo.clearbit.com/dropbox.com', fallbackIcon: '📁', category: 'Cloud Storage' },
      { id: 'icloud', name: 'iCloud+', logo: 'https://logo.clearbit.com/icloud.com', fallbackIcon: '☁️', category: 'Cloud Storage' },
      { id: 'google-one', name: 'Google One', logo: 'https://logo.clearbit.com/google.com', fallbackIcon: '🔷', category: 'Cloud Storage' },
      { id: 'zoom', name: 'Zoom Pro', logo: 'https://logo.clearbit.com/zoom.us', fallbackIcon: '📹', category: 'Software' },
      { id: 'linkedin', name: 'LinkedIn Premium', logo: 'https://logo.clearbit.com/linkedin.com', fallbackIcon: '💼', category: 'Professional' },
      { id: 'grammarly', name: 'Grammarly', logo: 'https://logo.clearbit.com/grammarly.com', fallbackIcon: '✍️', category: 'Software' },
      { id: 'canva', name: 'Canva Pro', logo: 'https://logo.clearbit.com/canva.com', fallbackIcon: '🖼️', category: 'Software' },
      { id: 'notion', name: 'Notion', logo: 'https://logo.clearbit.com/notion.so', fallbackIcon: '📝', category: 'Productivity' },
      { id: 'evernote', name: 'Evernote', logo: 'https://logo.clearbit.com/evernote.com', fallbackIcon: '🐘', category: 'Productivity' },
      { id: 'audible', name: 'Audible', logo: 'https://logo.clearbit.com/audible.com', fallbackIcon: '📚', category: 'Books' },
      { id: 'kindle', name: 'Kindle Unlimited', logo: 'https://logo.clearbit.com/amazon.com', fallbackIcon: '📖', category: 'Books' },
      { id: 'planet-fitness', name: 'Planet Fitness', logo: 'https://logo.clearbit.com/planetfitness.com', fallbackIcon: '💪', category: 'Fitness' },
      { id: 'peloton', name: 'Peloton', logo: 'https://logo.clearbit.com/onepeloton.com', fallbackIcon: '🚴', category: 'Fitness' },
      { id: 'nyt', name: 'NY Times', logo: 'https://logo.clearbit.com/nytimes.com', fallbackIcon: '📰', category: 'News' },
      { id: 'other-sub', name: 'Other', logo: null, fallbackIcon: '📋', category: 'Other' },
    ];

    // Subscriptions Modal State
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
    const [subscriptionForm, setSubscriptionForm] = useState({
      name: '',
      serviceId: 'netflix',
      amount: 0,
      dueDate: 1,
      frequency: 'monthly' as 'monthly' | 'yearly',
    });

    const handleAddSubscription = () => {
      setEditingSubscription(null);
      setSubscriptionForm({ name: '', serviceId: 'netflix', amount: 0, dueDate: 1, frequency: 'monthly' });
      setShowSubscriptionModal(true);
    };

    const handleEditSubscription = (subscription: Subscription) => {
      setEditingSubscription(subscription);
      const matchedService = subscriptionServices.find(s => s.name === subscription.name);
      setSubscriptionForm({
        name: subscription.name,
        serviceId: matchedService?.id || 'other-sub',
        amount: subscription.amount,
        dueDate: subscription.dueDate,
        frequency: subscription.frequency
      });
      setShowSubscriptionModal(true);
    };

    const handleDeleteSubscription = (id: string) => {
      if (confirm('Are you sure you want to delete this subscription?')) {
        setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      }
    };

    const handleSaveSubscription = () => {
      if (!subscriptionForm.name || subscriptionForm.amount <= 0) {
        alert('Please fill in all required fields');
        return;
      }

      const subscriptionData = {
        name: subscriptionForm.name,
        amount: subscriptionForm.amount,
        dueDate: subscriptionForm.dueDate,
        frequency: subscriptionForm.frequency
      };

      if (editingSubscription) {
        // Update existing subscription
        setSubscriptions(subscriptions.map(sub =>
          sub.id === editingSubscription.id
            ? { ...sub, ...subscriptionData }
            : sub
        ));
      } else {
        // Add new subscription
        const newSubscription: Subscription = {
          id: `s${Date.now()}`,
          ...subscriptionData
        };
        setSubscriptions([...subscriptions, newSubscription]);
      }

      setShowSubscriptionModal(false);
    };

    const handleServiceChange = (serviceId: string) => {
      const selectedService = subscriptionServices.find(s => s.id === serviceId);
      if (selectedService) {
        setSubscriptionForm({
          ...subscriptionForm,
          serviceId: serviceId,
          name: selectedService.name
        });
      }
    };

    // Emoji categories for expense picker
    const expenseEmojis = {
      'Food & Dining': ['🍕', '🍔', '🍜', '🍱', '🥗', '☕', '🍩', '🥤', '🍦', '🥘'],
      'Transportation': ['🚗', '⛽', '🚕', '🚌', '🚇', '✈️', '🚲', '🛴', '🏍️', '🚙'],
      'Shopping': ['🛒', '🛍️', '👕', '👗', '👟', '💄', '💍', '🎁', '📦', '🏪'],
      'Entertainment': ['🎬', '🎮', '🎯', '🎲', '🎨', '🎭', '🎪', '🎤', '🎸', '🎹'],
      'Health & Wellness': ['💊', '💉', '🏥', '⚕️', '🩺', '💪', '🧘', '🏃', '🚴', '⛹️'],
      'Personal Care': ['💇', '💅', '🧖', '🪒', '🧴', '🧼', '🪥', '🧻', '🧽', '🧹'],
      'Pet Care': ['🐕', '🐈', '🐠', '🐦', '🐹', '🐰', '🦎', '🐢', '🦜', '🐾'],
      'Home & Garden': ['🏡', '🔧', '🔨', '🪛', '🧰', '🪴', '🌱', '🌻', '🌷', '🏠'],
      'Education': ['📚', '📖', '✏️', '📝', '🎓', '🖊️', '📐', '📏', '🖍️', '📔'],
      'Office & Work': ['💼', '🖥️', '⌨️', '🖨️', '📊', '📈', '📋', '📎', '🖇️', '📌'],
      'Other': ['💰', '💵', '💳', '🏦', '💸', '📋', '⭐', '✨', '🎯', '📍'],
    };

    // Smart emoji suggestion based on expense name
    const suggestEmoji = (name: string): string => {
      const lowerName = name.toLowerCase();

      if (lowerName.includes('food') || lowerName.includes('lunch') || lowerName.includes('dinner') || lowerName.includes('restaurant') || lowerName.includes('cafe')) return '🍕';
      if (lowerName.includes('coffee') || lowerName.includes('starbucks')) return '☕';
      if (lowerName.includes('gas') || lowerName.includes('fuel')) return '⛽';
      if (lowerName.includes('car') || lowerName.includes('parking')) return '🚗';
      if (lowerName.includes('shop') || lowerName.includes('store')) return '🛒';
      if (lowerName.includes('cloth') || lowerName.includes('fashion')) return '👕';
      if (lowerName.includes('movie') || lowerName.includes('cinema')) return '🎬';
      if (lowerName.includes('game') || lowerName.includes('gaming')) return '🎮';
      if (lowerName.includes('gym') || lowerName.includes('fitness')) return '💪';
      if (lowerName.includes('doctor') || lowerName.includes('medical') || lowerName.includes('pharmacy')) return '🏥';
      if (lowerName.includes('hair') || lowerName.includes('salon')) return '💇';
      if (lowerName.includes('pet') || lowerName.includes('dog') || lowerName.includes('cat')) return '🐾';
      if (lowerName.includes('garden') || lowerName.includes('plant')) return '🌱';
      if (lowerName.includes('book') || lowerName.includes('education')) return '📚';
      if (lowerName.includes('office') || lowerName.includes('supply')) return '💼';

      return '💰'; // Default
    };

    // Recurring Expenses Modal State
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [expenseForm, setExpenseForm] = useState({
      name: '',
      amount: 0,
      dueDate: 1,
      frequency: 'monthly' as 'monthly' | 'yearly',
      emoji: '💰',
      autoAssign: true
    });
    const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<string>('Food & Dining');

    const handleAddExpense = () => {
      setEditingExpense(null);
      setExpenseForm({ name: '', amount: 0, dueDate: 1, frequency: 'monthly', emoji: '💰', autoAssign: true });
      setShowExpenseModal(true);
    };

    const handleEditExpense = (expense: any) => {
      setEditingExpense(expense);
      setExpenseForm({
        name: expense.description || expense.name,
        amount: expense.amount,
        dueDate: 1, // You might want to add dueDate to the expense type
        frequency: 'monthly',
        emoji: expense.emoji || '💰',
        autoAssign: false
      });
      setShowExpenseModal(true);
    };

    const handleDeleteExpense = (id: string) => {
      if (confirm('Are you sure you want to delete this recurring expense?')) {
        setRecurringExpenses(recurringExpenses.filter(expense => expense.id !== id));
      }
    };

    const handleSaveExpense = () => {
      if (!expenseForm.name || expenseForm.amount <= 0) {
        alert('Please fill in all required fields');
        return;
      }

      const expenseData = {
        name: expenseForm.name,
        amount: expenseForm.amount,
        dueDate: expenseForm.dueDate,
        frequency: expenseForm.frequency,
        emoji: expenseForm.emoji
      };

      if (editingExpense) {
        // Update existing expense
        setRecurringExpenses(recurringExpenses.map(expense =>
          expense.id === editingExpense.id
            ? { ...expense, ...expenseData }
            : expense
        ));
      } else {
        // Add new expense
        const newExpense: RecurringExpense = {
          id: `e${Date.now()}`,
          ...expenseData
        };
        setRecurringExpenses([...recurringExpenses, newExpense]);
      }

      setShowExpenseModal(false);
    };

    const handleExpenseNameChange = (name: string) => {
      const newForm = { ...expenseForm, name };
      if (expenseForm.autoAssign) {
        newForm.emoji = suggestEmoji(name);
      }
      setExpenseForm(newForm);
    };

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Finance Settings</h1>
          <p className="text-text-muted mt-0.5 font-medium text-sm">Manage recurring income, bills, subscriptions, and expenses</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-background-light dark:bg-background-dark rounded-xl p-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Income Sources
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'bills' ? 'bg-orange-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Bills
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'subscriptions' ? 'bg-purple-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'expenses' ? 'bg-blue-500 text-white shadow-sm' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Recurring Expenses
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          {activeTab === 'income' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Income Sources</h3>
                <button
                  onClick={handleAddIncome}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Add Income Source
                </button>
              </div>

              {incomes.map(income => (
                <div key={income.id} className="flex items-center justify-between p-4 rounded-xl bg-background-light dark:bg-background-dark border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">payments</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main dark:text-white">{income.source}</p>
                      <p className="text-xs text-text-muted capitalize">
                        {income.frequency} • ${income.amount.toLocaleString()}
                        {income.payDay && ` • ${income.payDay}s`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditIncome(income)}
                      className="size-9 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteIncome(income.id)}
                      className="size-9 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center text-text-muted hover:text-red-500 hover:border-red-300 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'bills' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Recurring Bills</h3>
                <button
                  onClick={handleAddBill}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Add Bill
                </button>
              </div>

              {bills.map(bill => {
                // Find matching emoji for the bill
                const billType = billTypes.find(t =>
                  t.label === bill.name ||
                  t.category === bill.category ||
                  bill.name.toLowerCase().includes(t.label.toLowerCase().split('/')[0])
                );
                const emoji = billType?.emoji || '📋';

                return (
                  <div key={bill.id} className="flex items-center justify-between p-4 rounded-xl bg-background-light dark:bg-background-dark border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-900/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-2xl">
                        {emoji}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main dark:text-white">{bill.name}</p>
                        <p className="text-xs text-text-muted">{bill.category} • ${bill.amount} • Due {bill.dueDate}th • {bill.frequency}</p>
                      </div>
                    </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditBill(bill)}
                      className="size-9 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      className="size-9 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center text-text-muted hover:text-red-500 hover:border-red-300 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Subscriptions</h3>
                <button
                  onClick={handleAddSubscription}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Add Subscription
                </button>
              </div>

              {subscriptions.map(sub => {
                // Find matching service for logo
                const service = subscriptionServices.find(s =>
                  s.name === sub.name ||
                  sub.name.toLowerCase().includes(s.name.toLowerCase())
                );
                const logo = service?.logo;
                const fallbackIcon = service?.fallbackIcon || '📋';

                return (
                  <div key={sub.id} className="flex items-center justify-between p-4 rounded-xl bg-background-light dark:bg-background-dark border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-900/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center p-2 shadow-sm overflow-hidden">
                        {logo ? (
                          <img
                            src={logo}
                            alt={sub.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Fallback to emoji if logo fails to load
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-2xl">${fallbackIcon}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span className="text-2xl">{fallbackIcon}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main dark:text-white">{sub.name}</p>
                        <p className="text-xs text-text-muted">${sub.amount} • Due {sub.dueDate}th • {sub.frequency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSubscription(sub)}
                        className="size-9 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(sub.id)}
                        className="size-9 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center text-text-muted hover:text-red-500 hover:border-red-300 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Recurring Expenses</h3>
                <button
                  onClick={handleAddExpense}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Add Expense
                </button>
              </div>

              {recurringExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-text-muted/30 mb-4">receipt_long</span>
                  <p className="text-text-muted mb-4">No recurring expenses set up yet</p>
                  <p className="text-xs text-text-muted">Add recurring monthly expenses like gym memberships, parking fees, etc.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recurringExpenses.map(expense => (
                    <div key={expense.id} className="p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-2xl">
                          {expense.emoji || '💰'}
                        </div>
                        <div>
                          <h4 className="font-bold text-text-main dark:text-white">{expense.name}</h4>
                          <p className="text-sm text-text-muted">
                            ${expense.amount.toFixed(2)} · Due {expense.dueDate}{expense.dueDate === 1 ? 'st' : expense.dueDate === 2 ? 'nd' : expense.dueDate === 3 ? 'rd' : 'th'} of month · {expense.frequency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="size-9 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="size-9 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center text-text-muted hover:text-red-500 hover:border-red-300 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Income Modal */}
        {showIncomeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-text-main dark:text-white">
                    {editingIncome ? 'Edit Income Source' : 'Add Income Source'}
                  </h2>
                  <button
                    onClick={() => setShowIncomeModal(false)}
                    className="size-9 rounded-xl bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px] text-text-muted">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Company/Source Name */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Company / Source Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={incomeForm.source}
                    onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                    placeholder="e.g., Acme Corp, Freelance Work"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                  />
                </div>

                {/* Pay Occurrence */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Pay Occurrence <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={incomeForm.frequency}
                    onChange={(e) => setIncomeForm({ ...incomeForm, frequency: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly (Every 2 weeks)</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Amount per Occurrence <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                    <input
                      type="number"
                      value={incomeForm.amount || ''}
                      onChange={(e) => setIncomeForm({ ...incomeForm, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="1240"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1.5">
                    {incomeForm.frequency === 'weekly' && `Monthly equivalent: $${(incomeForm.amount * 4).toLocaleString()}`}
                    {incomeForm.frequency === 'bi-weekly' && `Monthly equivalent: $${(incomeForm.amount * 2).toLocaleString()}`}
                    {incomeForm.frequency === 'monthly' && `Per month: $${incomeForm.amount.toLocaleString()}`}
                    {incomeForm.frequency === 'yearly' && `Monthly equivalent: $${(incomeForm.amount / 12).toLocaleString()}`}
                  </p>
                </div>

                {/* Pay Day */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Pay Day
                  </label>
                  <select
                    value={incomeForm.payDay}
                    onChange={(e) => setIncomeForm({ ...incomeForm, payDay: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                  <p className="text-xs text-text-muted mt-1.5">
                    {incomeForm.frequency === 'weekly' && 'Which day of the week do you get paid?'}
                    {incomeForm.frequency === 'bi-weekly' && 'Which day of the week do you get paid?'}
                    {incomeForm.frequency === 'monthly' && 'What day of the month do you get paid?'}
                    {incomeForm.frequency === 'yearly' && 'When do you receive this income?'}
                  </p>
                </div>

                {/* Example Preview */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-900/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[20px] mt-0.5">info</span>
                    <div>
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-1">Preview</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        {incomeForm.source || 'Your Company'}: ${incomeForm.amount.toLocaleString()} {incomeForm.frequency}
                        {incomeForm.payDay && ` on ${incomeForm.payDay}s`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                <button
                  onClick={() => setShowIncomeModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveIncome}
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {editingIncome ? 'Save Changes' : 'Add Income'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bills Modal */}
        {showBillModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-text-main dark:text-white">
                    {editingBill ? 'Edit Bill' : 'Add Bill'}
                  </h2>
                  <button
                    onClick={() => setShowBillModal(false)}
                    className="size-9 rounded-xl bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px] text-text-muted">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Bill Type Picker */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-3">
                    Bill Type <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {billTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => handleBillTypeChange(type.id)}
                        className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all flex items-center gap-3 text-left hover:scale-[1.02] ${
                          billForm.billType === type.id
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark hover:border-orange-300'
                        }`}
                      >
                        <span className="text-2xl">{type.emoji}</span>
                        <span className="text-sm font-bold text-text-main dark:text-white flex-1">
                          {type.label}
                        </span>
                        <span className="text-xs text-text-muted font-medium">{type.category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Name */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Bill Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={billForm.name}
                    onChange={(e) => setBillForm({ ...billForm, name: e.target.value })}
                    placeholder="e.g., Pacific Gas & Electric, ComEd"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                  />
                  <p className="text-xs text-text-muted mt-1.5">
                    Auto-filled based on bill type. You can customize it.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                      <input
                        type="number"
                        value={billForm.amount || ''}
                        onChange={(e) => setBillForm({ ...billForm, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="120"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={billForm.dueDate}
                      onChange={(e) => setBillForm({ ...billForm, dueDate: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>
                          {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Frequency
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBillForm({ ...billForm, frequency: 'monthly' })}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                        billForm.frequency === 'monthly'
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-background-light dark:bg-background-dark text-text-muted border border-gray-200 dark:border-gray-700 hover:border-orange-300'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillForm({ ...billForm, frequency: 'yearly' })}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                        billForm.frequency === 'yearly'
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-background-light dark:bg-background-dark text-text-muted border border-gray-200 dark:border-gray-700 hover:border-orange-300'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">
                      {billTypes.find(t => t.id === billForm.billType)?.emoji || '📋'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-orange-900 dark:text-orange-100 mb-1">Preview</p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        {billForm.name || 'Bill Name'}: ${billForm.amount.toLocaleString()} • Due {billForm.dueDate}th • {billForm.frequency}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Category: {billForm.category}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                <button
                  onClick={() => setShowBillModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBill}
                  className="flex-1 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-all"
                >
                  {editingBill ? 'Save Changes' : 'Add Bill'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions Modal */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-text-main dark:text-white">
                    {editingSubscription ? 'Edit Subscription' : 'Add Subscription'}
                  </h2>
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="size-9 rounded-xl bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px] text-text-muted">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Service Picker */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-3">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1">
                    {subscriptionServices.map(service => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceChange(service.id)}
                        className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                          subscriptionForm.serviceId === service.id
                            ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-900/30 shadow-lg bg-purple-50 dark:bg-purple-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="size-12 rounded-lg mx-auto mb-2 flex items-center justify-center p-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 overflow-hidden">
                          {service.logo ? (
                            <img
                              src={service.logo}
                              alt={service.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // Fallback to emoji if logo fails to load
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-2xl">${service.fallbackIcon}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-2xl">{service.fallbackIcon}</span>
                          )}
                        </div>
                        <div className="text-[10px] font-bold text-text-main dark:text-white leading-tight text-center">
                          {service.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subscription Name */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Subscription Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subscriptionForm.name}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, name: e.target.value })}
                    placeholder="e.g., Netflix Premium, Spotify Family"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                  />
                  <p className="text-xs text-text-muted mt-1.5">
                    Auto-filled based on service. You can customize it (e.g., add plan type).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                      <input
                        type="number"
                        value={subscriptionForm.amount || ''}
                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="15.99"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Renewal Date <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={subscriptionForm.dueDate}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, dueDate: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>
                          {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Billing Frequency
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSubscriptionForm({ ...subscriptionForm, frequency: 'monthly' })}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                        subscriptionForm.frequency === 'monthly'
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-background-light dark:bg-background-dark text-text-muted border border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setSubscriptionForm({ ...subscriptionForm, frequency: 'yearly' })}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                        subscriptionForm.frequency === 'yearly'
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-background-light dark:bg-background-dark text-text-muted border border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-900/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="size-14 rounded-xl flex items-center justify-center p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
                      {(() => {
                        const selectedService = subscriptionServices.find(s => s.id === subscriptionForm.serviceId);
                        const logo = selectedService?.logo;
                        const fallbackIcon = selectedService?.fallbackIcon || '📋';

                        return logo ? (
                          <img
                            src={logo}
                            alt={selectedService.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-3xl">${fallbackIcon}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span className="text-3xl">{fallbackIcon}</span>
                        );
                      })()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-1">Preview</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        {subscriptionForm.name || 'Service Name'}: ${subscriptionForm.amount.toLocaleString()} • Renews {subscriptionForm.dueDate}th • {subscriptionForm.frequency}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        Category: {subscriptionServices.find(s => s.id === subscriptionForm.serviceId)?.category || 'Other'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSubscription}
                  className="flex-1 px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/20 transition-all"
                >
                  {editingSubscription ? 'Save Changes' : 'Add Subscription'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recurring Expenses Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-text-main dark:text-white">
                    {editingExpense ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
                  </h2>
                  <button
                    onClick={() => setShowExpenseModal(false)}
                    className="size-9 rounded-xl bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px] text-text-muted">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Expense Name */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Expense Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={expenseForm.name}
                    onChange={(e) => handleExpenseNameChange(e.target.value)}
                    placeholder="e.g., Monthly Parking, Daycare, Pet Food"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>

                {/* Emoji Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-text-main dark:text-white">
                      Icon
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expenseForm.autoAssign}
                        onChange={(e) => {
                          const autoAssign = e.target.checked;
                          setExpenseForm({
                            ...expenseForm,
                            autoAssign,
                            emoji: autoAssign ? suggestEmoji(expenseForm.name) : expenseForm.emoji
                          });
                        }}
                        className="rounded"
                      />
                      Smart Auto-Assign
                    </label>
                  </div>

                  {!expenseForm.autoAssign && (
                    <>
                      {/* Category Tabs */}
                      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        {Object.keys(expenseEmojis).map(category => (
                          <button
                            key={category}
                            onClick={() => setSelectedEmojiCategory(category)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                              selectedEmojiCategory === category
                                ? 'bg-blue-500 text-white'
                                : 'bg-background-light dark:bg-background-dark text-text-muted hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>

                      {/* Emoji Grid */}
                      <div className="grid grid-cols-10 gap-2 p-4 bg-background-light dark:bg-background-dark rounded-xl max-h-48 overflow-y-auto">
                        {expenseEmojis[selectedEmojiCategory as keyof typeof expenseEmojis]?.map((emoji, idx) => (
                          <button
                            key={idx}
                            onClick={() => setExpenseForm({ ...expenseForm, emoji })}
                            className={`size-10 rounded-lg flex items-center justify-center text-2xl transition-all hover:scale-110 ${
                              expenseForm.emoji === emoji
                                ? 'bg-blue-500 ring-2 ring-blue-300 dark:ring-blue-700 shadow-md'
                                : 'hover:bg-white dark:hover:bg-gray-800'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Current Selected Emoji Display */}
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/30">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{expenseForm.emoji}</div>
                      <div>
                        <p className="text-xs font-bold text-blue-900 dark:text-blue-100">
                          {expenseForm.autoAssign ? 'Auto-assigned' : 'Selected'} Icon
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {expenseForm.autoAssign && 'Changes automatically based on expense name'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                      <input
                        type="number"
                        value={expenseForm.amount || ''}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="50"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={expenseForm.dueDate}
                      onChange={(e) => setExpenseForm({ ...expenseForm, dueDate: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>
                          {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Frequency
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setExpenseForm({ ...expenseForm, frequency: 'monthly' })}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                        expenseForm.frequency === 'monthly'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-background-light dark:bg-background-dark text-text-muted border border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setExpenseForm({ ...expenseForm, frequency: 'yearly' })}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                        expenseForm.frequency === 'yearly'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-background-light dark:bg-background-dark text-text-muted border border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{expenseForm.emoji}</div>
                    <div>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">Preview</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {expenseForm.name || 'Expense Name'}: ${expenseForm.amount.toLocaleString()} • Due {expenseForm.dueDate}th • {expenseForm.frequency}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveExpense}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 transition-all"
                >
                  {editingExpense ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============== RENDER ==============
  const renderContent = () => {
    switch (currentView) {
      case 'overview': return <OverviewView />;
      case 'dashboard': return <DashboardView />;
      case 'calendar': return <CalendarView />;
      case 'tx': return <TransactionsView />;
      case 'savings': return <SavingsView />;
      case 'debt': return <DebtView />;
      case 'settings': return <SettingsView />;
      default: return null;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};

export default FinanceHub;
