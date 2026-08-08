import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Zap, ChevronDown, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../ui/Toast';
import Loading from '../ui/Loading';

const BuyToken = () => {
  const [meters, setMeters] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchMeters(); }, []);

  const fetchMeters = async () => {
    try {
      const { data } = await api.get('/meters');
      setMeters(data.meters || []);
      if (data.meters?.length > 0) setSelectedMeter(data.meters[0]._id);
    } catch (error) { showToast('Failed to load meters', 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMeter) { showToast('Please select a meter', 'error'); return; }
    if (!amount || amount < 100) { showToast('Minimum amount is ₦100', 'error'); return; }
    setProcessing(true);
    try {
      const { data } = await api.post('/payments/initialize', { meterId: selectedMeter, amount: parseInt(amount) });
      if (data.success && data.authorization_url) window.location.href = data.authorization_url;
      else showToast('Payment initialization failed', 'error');
    } catch (error) { showToast(error.response?.data?.message || 'Payment failed', 'error'); }
    finally { setProcessing(false); }
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  if (loading) return <Loading fullScreen />;

  if (meters.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="card">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">No Meters Found</h2>
          <p className="text-gray-600 mt-2">You need to add a meter before buying tokens</p>
          <button onClick={() => navigate('/meters')} className="btn-primary mt-6">Add Meter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Buy Electricity Token</h1>
        <p className="text-gray-600 mt-1">Purchase prepaid units for your meter</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Meter</label>
            <div className="relative">
              <select value={selectedMeter} onChange={(e) => setSelectedMeter(e.target.value)} className="input-field appearance-none pr-10" required>
                {meters.map((meter) => (<option key={meter._id} value={meter._id}>{meter.alias} — {meter.meterNumber}</option>))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field text-lg font-semibold" placeholder="Enter amount" min="100" max="500000" required />
            <p className="text-xs text-gray-500 mt-1">Min: ₦100 — Max: ₦500,000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Select</label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amt) => (
                <button key={amt} type="button" onClick={() => setAmount(amt.toString())}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${amount === amt.toString() ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {amount && parseInt(amount) >= 100 && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Amount</span><span className="font-medium">₦{parseInt(amount).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Est. Units</span><span className="font-medium">~{Math.round(parseInt(amount) / 58.5)} kWh</span></div>
              <div className="border-t border-gray-200 pt-2 flex justify-between"><span className="font-medium text-gray-900">Total</span><span className="font-bold text-primary-700">₦{parseInt(amount).toLocaleString()}</span></div>
            </div>
          )}

          <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2" disabled={processing}>
            {processing ? (<><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>) : (<><CreditCard className="w-5 h-5" /> Pay with Paystack</>)}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuyToken;
