import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { DynamicDashboard, WidgetConfig } from '../../components/dashboard/DynamicDashboard';
import { DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const payrollWidgets: WidgetConfig[] = [
  {
    id: 'total-payroll',
    type: 'stat',
    title: 'Total Payroll (This Month)',
    value: '$452,500',
    trend: { value: 2.5, isPositive: true },
    icon: <DollarSign className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'pending-payments',
    type: 'stat',
    title: 'Pending Payments',
    value: '$12,400',
    trend: { value: 15, isPositive: false },
    icon: <AlertCircle className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'processed-payslips',
    type: 'stat',
    title: 'Processed Payslips',
    value: '1,240',
    icon: <FileText className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'taxes-paid',
    type: 'stat',
    title: 'Taxes Paid',
    value: '$85,200',
    icon: <CheckCircle className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'payroll-trend',
    type: 'chart',
    title: 'Payroll Trend (Last 6 Months)',
    chartType: 'area',
    data: [
      { name: 'Jan', amount: 420000 },
      { name: 'Feb', amount: 425000 },
      { name: 'Mar', amount: 430000 },
      { name: 'Apr', amount: 435000 },
      { name: 'May', amount: 440000 },
      { name: 'Jun', amount: 452500 },
    ],
    dataKeys: ['amount'],
    colors: ['#3b82f6'],
    size: 'large',
  },
  {
    id: 'expense-breakdown',
    type: 'chart',
    title: 'Expense Breakdown',
    chartType: 'pie',
    data: [
      { name: 'Base Salary', value: 350000 },
      { name: 'Bonuses', value: 45000 },
      { name: 'Taxes', value: 85200 },
      { name: 'Benefits', value: 25000 },
    ],
    dataKeys: ['value'],
    size: 'medium',
  },
  {
    id: 'recent-transactions',
    type: 'table',
    title: 'Recent Transactions',
    columns: [
      { key: 'employee', label: 'Employee' },
      { key: 'amount', label: 'Amount' },
      { key: 'date', label: 'Date' },
      { 
        key: 'status', 
        label: 'Status',
        render: (val: unknown) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            val === 'Paid' ? 'bg-green-100 text-green-800' : 
            val === 'Processing' ? 'bg-blue-100 text-blue-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {String(val)}
          </span>
        )
      },
    ],
    data: [
      { employee: 'Sarah Connor', amount: '$4,500', date: 'Oct 25, 2023', status: 'Paid' },
      { employee: 'John Smith', amount: '$3,800', date: 'Oct 25, 2023', status: 'Paid' },
      { employee: 'Mike Johnson', amount: '$5,200', date: 'Oct 26, 2023', status: 'Processing' },
      { employee: 'Emily Davis', amount: '$4,100', date: 'Oct 26, 2023', status: 'Pending' },
    ],
    size: 'full',
  }
];

export default function Payroll() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <DynamicDashboard 
          moduleName="payroll"
          title="Payroll Dashboard"
          widgets={payrollWidgets}
        />
      </main>
    </div>
  );
}
