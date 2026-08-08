import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Gauge, CreditCard, History, Wallet, Activity } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Loading from '../ui/Loading';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [metersRes, historyRes] = await Promise.all([
        api.get('/meters'), api.get('/payments/history?limit=5')
      ]);
      const meters = metersRes.data.meters || [];
      const transactions = historyRes.data.transactions || [];
      const totalSpent = transactions.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount, 0);
      const totalUnits = transactions.filter(t => t.status === 'success').reduce((sum, t) => sum + (t.units || 0), 0);
      setStats({ meters: meters.length, transactions: transactions.length, spent: totalSpent, units: totalUnits });
      setRecent(transactions.slice(0, 5));
    } catch (error) { console.error('Dashboard error:', error); }
    finally { setLoading(false); }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
        <p className="text-gray-600 mt-1">Here's your electricity overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-primary-50 rounded-lg"><Gauge className="w-6 h-6 text-primary-600" /></div>
          <div><p className="text-sm text-gray-600">My Meters</p><p className="text-2xl font-bold text-gray-900">{stats?.meters || 0}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg"><Wallet className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-sm text-gray-600">Total Spent</p><p className="text-2xl font-bold text-gray-900">₦{(stats?.spent || 0).toLocaleString()}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg"><Zap className="w-6 h-6 text-amber-600" /></div>
          <div><p className="text-sm text-gray-600">Units Purchased</p><p className="text-2xl font-bold text-gray-900">{Math.round(stats?.units || 0)} kWh</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg"><Activity className="w-6 h-6 text-purple-600" /></div>
          <div><p className="text-sm text-gray-600">Transactions</p><p className="text-2xl font-bold text-gray-900">{stats?.transactions || 0}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link to="/buy-token" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors"><CreditCard className="w-6 h-6 text-primary-700" /></div>
            <div><h3 className="font-semibold text-gray-900">Buy Token</h3><p className="text-sm text-gray-600">Purchase electricity for any of your meters</p></div>
          </div>
        </Link>
        <Link to="/meters" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors"><Gauge className="w-6 h-6 text-gray-700" /></div>
            <div><h3 className="font-semibold text-gray-900">Manage Meters</h3><p className="text-sm text-gray-600">Add, remove, or view your saved meters</p></div>
          </div>
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No transactions yet</p>
            <Link to="/buy-token" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">Buy your first token</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Meter</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">{tx.meterNumber}</td>
                    <td className="py-3 text-sm font-medium text-gray-900">₦{tx.amount.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        tx.status === 'success' ? 'bg-green-100 text-green-700' :
                        tx.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{tx.status}</span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
