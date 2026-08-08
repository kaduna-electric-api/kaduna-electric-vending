import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../ui/Toast';
import Loading from '../ui/Loading';

const Receipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTransaction(); }, [id]);

  const fetchTransaction = async () => {
    try {
      const { data } = await api.get(`/payments/transactions/${id}`);
      setTransaction(data.transaction);
    } catch (error) { showToast('Transaction not found', 'error'); navigate('/history'); }
    finally { setLoading(false); }
  };

  const downloadReceipt = async () => {
    try {
      const response = await api.get(`/payments/transactions/${id}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${transaction.paystackReference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Receipt downloaded', 'success');
    } catch (error) { showToast('Failed to download', 'error'); }
  };

  if (loading) return <Loading fullScreen />;
  if (!transaction) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/history')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft className="w-4 h-4" /> Back to History</button>

      <div className="card border-2 border-gray-200">
        <div className="text-center border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-primary-800">KADUNA ELECTRIC</h1>
          <p className="text-gray-600">Token Vending System</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700 font-medium">PAYMENT SUCCESSFUL</span>
          </div>
        </div>

        {transaction.token && (
          <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6 mb-6 text-center">
            <p className="text-sm text-primary-700 font-medium mb-2">YOUR 20-DIGIT TOKEN</p>
            <p className="text-3xl font-mono font-bold text-primary-800 tracking-widest">{transaction.token.match(/.{4}/g).join('  ')}</p>
            <p className="text-xs text-primary-600 mt-2">Enter this on your meter keypad</p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Transaction Reference</span><span className="font-medium text-gray-900">{transaction.paystackReference}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Meter Number</span><span className="font-medium text-gray-900">{transaction.meterNumber}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Amount Paid</span><span className="font-medium text-gray-900">₦{transaction.amount.toLocaleString()}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Units Purchased</span><span className="font-medium text-gray-900">{transaction.units} kWh</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Payment Method</span><span className="font-medium text-gray-900 capitalize">{transaction.paymentMethod}</span></div>
          <div className="flex justify-between py-2"><span className="text-gray-600">Date & Time</span><span className="font-medium text-gray-900">{new Date(transaction.createdAt).toLocaleString('en-NG')}</span></div>
        </div>

        <button onClick={downloadReceipt} className="w-full btn-primary flex items-center justify-center gap-2"><Download className="w-5 h-5" /> Download PDF Receipt</button>
        <p className="text-center text-xs text-gray-500 mt-4">Thank you for using Kaduna Electric Token Vending System</p>
      </div>
    </div>
  );
};

export default Receipt;
