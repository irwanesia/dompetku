export type TransactionType = 'income' | 'expense';

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  iconName: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  notes: string;
  date: string; // ISO format YYYY-MM-DD
  createdAt: number;
}

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'gaji', name: 'Gaji Pokok', type: 'income', color: '#10b981', iconName: 'Banknote' },
  { id: 'freelance', name: 'Freelance & Side Job', type: 'income', color: '#06b6d4', iconName: 'Briefcase' },
  { id: 'bisnis', name: 'Usaha & Bisnis', type: 'income', color: '#3b82f6', iconName: 'Store' },
  { id: 'investasi', name: 'Investasi & Bunga', type: 'income', color: '#8b5cf6', iconName: 'TrendingUp' },
  { id: 'hadiah', name: 'Hadiah & Bonus', type: 'income', color: '#ec4899', iconName: 'Gift' },
  { id: 'lainnya_income', name: 'Pemasukan Lain', type: 'income', color: '#64748b', iconName: 'PlusCircle' },
];

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'makanan', name: 'Makanan & Minuman', type: 'expense', color: '#f97316', iconName: 'Utensils' },
  { id: 'transportasi', name: 'Transport & Bensin', type: 'expense', color: '#3b82f6', iconName: 'Car' },
  { id: 'belanja', name: 'Belanja Kebutuhan', type: 'expense', color: '#ec4899', iconName: 'ShoppingBag' },
  { id: 'tagihan', name: 'Tagihan & Utilitas', type: 'expense', color: '#ef4444', iconName: 'Receipt' },
  { id: 'hiburan', name: 'Hiburan & Hobi', type: 'expense', color: '#8b5cf6', iconName: 'Tv' },
  { id: 'kesehatan', name: 'Kesehatan & Obat', type: 'expense', color: '#14b8a6', iconName: 'HeartPulse' },
  { id: 'pendidikan', name: 'Edukasi & Buku', type: 'expense', color: '#eab308', iconName: 'GraduationCap' },
  { id: 'keluarga', name: 'Keluarga & Sosial', type: 'expense', color: '#a855f7', iconName: 'Users' },
  { id: 'lainnya_expense', name: 'Pengeluaran Lain', type: 'expense', color: '#64748b', iconName: 'MoreHorizontal' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function getCategoryById(id: string): CategoryInfo {
  const found = ALL_CATEGORIES.find((c) => c.id === id);
  if (found) return found;
  return {
    id,
    name: id,
    type: 'expense',
    color: '#64748b',
    iconName: 'MoreHorizontal',
  };
}

// Helper to get formatted today string (YYYY-MM-DD)
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initial realistic transactions
export function getInitialTransactions(): Transaction[] {
  const today = getTodayDateString();
  const d = new Date();
  
  const yesterdayDate = new Date(d);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

  const twoDaysAgoDate = new Date(d);
  twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);
  const twoDaysAgo = `${twoDaysAgoDate.getFullYear()}-${String(twoDaysAgoDate.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgoDate.getDate()).padStart(2, '0')}`;

  return [
    {
      id: 'tx-1',
      type: 'income',
      amount: 4500000,
      category: 'gaji',
      notes: 'Gaji pokok bulanan & tunjangan',
      date: twoDaysAgo,
      createdAt: Date.now() - 172800000,
    },
    {
      id: 'tx-2',
      type: 'income',
      amount: 750000,
      category: 'freelance',
      notes: 'Pembayaran project UI/UX desain',
      date: yesterday,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 45000,
      category: 'makanan',
      notes: 'Makan siang nasi padang + es teh',
      date: today,
      createdAt: Date.now() - 28000000,
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 25000,
      category: 'transportasi',
      notes: 'Bensin motor pertalite',
      date: today,
      createdAt: Date.now() - 21000000,
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 32000,
      category: 'makanan',
      notes: 'Kopi susu & camilan sore',
      date: today,
      createdAt: Date.now() - 14000000,
    },
    {
      id: 'tx-6',
      type: 'income',
      amount: 150000,
      category: 'bisnis',
      notes: 'Hasil penjualan toko online harian',
      date: today,
      createdAt: Date.now() - 7000000,
    },
    {
      id: 'tx-7',
      type: 'expense',
      amount: 120000,
      category: 'belanja',
      notes: 'Belanja bahan dapur mingguan',
      date: yesterday,
      createdAt: Date.now() - 75000000,
    },
    {
      id: 'tx-8',
      type: 'expense',
      amount: 85000,
      category: 'tagihan',
      notes: 'Paket data internet 50GB',
      date: yesterday,
      createdAt: Date.now() - 65000000,
    },
  ];
}
