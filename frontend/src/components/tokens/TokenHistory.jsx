import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../ui/Toast';
import Loading from '../ui/Loading';

const TokenHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchHistory(); }, [page]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get(`/payments/history?page=${page}&limit=10`);
      setTransactions(data.transactions || []);
      setPagination({ total: data.total, pages: data.pages, page: data.page });
    } catch (error) { showToast('Failed to load history', 'error'); }
    finally { setLoading(false); }
  };

  const downloadReceipt = async (id) => {
    try {
      const response = await api.get(`/payments/transactions/${id}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Receipt downloaded', 'success');
    } catch (error) { showToast('Failed to download receipt', 'error'); }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-1">View all your token purchases</p>
      </div>

      {transactions.length === 0 ? (
        <div className="card text-center py-12">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
          <p className="text-gray-600 mt-1">Your purchase history will appear here</p>
        </div>
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Date</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Meter</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Units</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Token</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString('en-NG')}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{tx.meterNumber}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">₦{tx.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{tx.units || '-'} kWh</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        tx.status === 'success' ? 'bg-green-100 text-green-700' :
                        tx.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{tx.status}</span>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-primary-700">{tx.token ? tx.token.match(/.{4}/g).join(' ') : '-'}</td>
                    <td className="py-3 px-4 text-right">
                      {tx.status === 'success' && (
                        <button onClick={() => downloadReceipt(tx._id)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Download Receipt">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary flex items-center gap-2 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /> Previous</button>
              <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary flex items-center gap-2 disabled:opacity-50">Next <ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TokenHistory;
