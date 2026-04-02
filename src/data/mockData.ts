export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description: string;
}

export type Role = 'admin' | 'viewer';

export const CATEGORIES = [
  'Salary',
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Rent',
  'Utilities',
  'Healthcare',
  'Travel',
  'Investment',
  'Others'
];

const generateRandomData = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some random variety
    const isIncome = Math.random() > 0.7; // 30% chance of income
    const category = isIncome ? 'Salary' : CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1];
    
    transactions.push({
      id: `${i}-${Date.now()}`,
      date: date.toISOString().split('T')[0],
      amount: isIncome ? Math.floor(Math.random() * 5000) + 1000 : Math.floor(Math.random() * 500) + 10,
      category: category,
      type: isIncome ? 'income' : 'expense',
      description: isIncome ? 'Monthly Salary' : `Expenses for ${category.toLowerCase()}`
    });
  }
  
  return transactions;
};

export const INITIAL_TRANSACTIONS = generateRandomData();
