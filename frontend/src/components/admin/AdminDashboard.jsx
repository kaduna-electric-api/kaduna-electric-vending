import { useEffect, useState } from 'react';
import { Users, CreditCard, Gauge, DollarSign, Activity } from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../ui/Toast';
import Loading from '../ui/Loading';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data.stats);
      setRecentTransactions(data.recentTransactions || []);
    } catch (error) { showToast('Failed to load admin dashboard', 'error'); }
    finally { setLoading(false); }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor and manage the platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
          <div><p className="text-sm text-gray-600">Total Users</p><p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-sm text-gray-600">Total Revenue</p><p className="text-2xl font-bold text-gray-900">₦{(stats?.totalRevenue || 0).toLocaleString()}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg"><CreditCard className="w-6 h-6 text-purple-600" /></div>
          <div><p className="text-sm text-gray-600">Transactions</p><p className="text-2xl font-bold text-gray-900">{stats?.totalTransactions || 0}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg"><Gauge className="w-6 h-6 text-amber-600" /></div>
          <div><p className="text-sm text-gray-600">Total Meters</p><p className="text-2xl font-bold text-gray-900">{stats?.totalMeters || 0}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3 mb-4"><Activity className="w-5 h-5 text-primary-600" /><h2 className="font-semibold text-gray-900">Today's Overview</h2></div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-600">Transactions Today</span><span className="font-bold text-gray-900">{stats?.todayTransactions || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Revenue Today</span><span className="font-bold text-green-600">₦{(stats?.todayRevenue || 0).toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Meter</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-50">
                  <td className="py-3 text-sm text-gray-900">{tx.user?.firstName} {tx.user?.lastName}</td>
                  <td className="py-3 text-sm text-gray-600">{tx.meterNumber}</td>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
