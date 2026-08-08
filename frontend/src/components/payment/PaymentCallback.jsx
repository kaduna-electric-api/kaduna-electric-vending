import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../ui/Toast';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference) verifyPayment(reference);
    else setStatus('failed');
  }, []);

  const verifyPayment = async (reference) => {
    try {
      const { data } = await api.get(`/payments/verify/${reference}`);
      if (data.success) { setStatus('success'); setTransaction(data.transaction); showToast('Payment successful! Token generated.', 'success'); }
      else { setStatus('failed'); showToast(data.message || 'Payment verification failed', 'error'); }
    } catch (error) { setStatus('failed'); showToast(error.response?.data?.message || 'Verification failed', 'error'); }
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Verifying Payment...</h2>
          <p className="text-gray-600 mt-2">Please wait while we confirm your transaction</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Payment Failed</h2>
          <p className="text-gray-600 mt-2">We couldn't verify your payment. If you were charged, please contact support.</p>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={() => navigate('/buy-token')} className="btn-primary">Try Again</button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">Go Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
        <p className="text-gray-600 mt-2">Your electricity token has been generated</p>

        {transaction?.token && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">Your 20-Digit Token</p>
            <div className="token-display">{transaction.token.match(/.{4}/g).join(' ')}</div>
            <p className="text-xs text-gray-500 mt-2">Enter this on your meter keypad</p>
          </div>
        )}

        <div className="card mt-6 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Meter</span><span className="font-medium">{transaction?.meterNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Amount</span><span className="font-medium">₦{transaction?.amount?.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Units</span><span className="font-medium">{transaction?.units} kWh</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Reference</span><span className="font-medium text-xs">{transaction?.paystackReference}</span></div>
          </div>
        </div>

        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => navigate('/history')} className="btn-primary">View History</button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">Dashboard</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
