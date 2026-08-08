import { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle, Gauge, Home } from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../ui/Toast';
import Loading from '../ui/Loading';

const MeterManager = () => {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [validating, setValidating] = useState(false);
  const [newMeter, setNewMeter] = useState({ meterNumber: '', alias: '', address: '' });
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => { fetchMeters(); }, []);

  const fetchMeters = async () => {
    try { const { data } = await api.get('/meters'); setMeters(data.meters || []); }
    catch (error) { showToast('Failed to load meters', 'error'); }
    finally { setLoading(false); }
  };

  const validateMeter = async () => {
    if (!newMeter.meterNumber) return;
    setValidating(true); setValidationResult(null);
    try {
      const { data } = await api.post('/meters/validate', { meterNumber: newMeter.meterNumber });
      setValidationResult(data);
      if (!data.valid) showToast(data.message, 'error');
      else showToast('Meter validated successfully!', 'success');
    } catch (error) { showToast('Validation failed', 'error'); }
    finally { setValidating(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/meters', newMeter);
      showToast('Meter added successfully!', 'success');
      setNewMeter({ meterNumber: '', alias: '', address: '' });
      setValidationResult(null); setShowAdd(false); fetchMeters();
    } catch (error) { showToast(error.response?.data?.message || 'Failed to add meter', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this meter?')) return;
    try { await api.delete(`/meters/${id}`); showToast('Meter removed', 'success'); fetchMeters(); }
    catch (error) { showToast('Failed to remove meter', 'error'); }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">My Meters</h1><p className="text-gray-600 mt-1">Manage your electricity meters</p></div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Meter</button>
      </div>

      {showAdd && (
        <div className="card mb-6 border-2 border-primary-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Meter</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meter Number</label>
              <div className="flex gap-2">
                <input type="text" value={newMeter.meterNumber} onChange={(e) => setNewMeter({ ...newMeter, meterNumber: e.target.value })} className="input-field flex-1" placeholder="Enter 11-15 digit meter number" required />
                <button type="button" onClick={validateMeter} disabled={validating || !newMeter.meterNumber} className="btn-secondary whitespace-nowrap">{validating ? 'Checking...' : 'Validate'}</button>
              </div>
            </div>
            {validationResult?.valid && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-5 h-5" /><span>Valid meter: {validationResult.customerName} — {validationResult.status}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Alias (Nickname)</label><input type="text" value={newMeter.alias} onChange={(e) => setNewMeter({ ...newMeter, alias: e.target.value })} className="input-field" placeholder="e.g., Home, Office, Shop" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input type="text" value={newMeter.address} onChange={(e) => setNewMeter({ ...newMeter, address: e.target.value })} className="input-field" placeholder="Meter location address" /></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={!validationResult?.valid}>Save Meter</button>
              <button type="button" onClick={() => { setShowAdd(false); setValidationResult(null); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {meters.length === 0 ? (
        <div className="card text-center py-12">
          <Gauge className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No meters added yet</h3>
          <p className="text-gray-600 mt-1">Add your first meter to start buying tokens</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {meters.map((meter) => (
            <div key={meter._id} className="card flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 rounded-lg"><Home className="w-6 h-6 text-primary-600" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{meter.alias || 'My Meter'}</h3>
                  <p className="text-sm text-gray-600 mt-1">Meter: {meter.meterNumber}</p>
                  {meter.address && <p className="text-sm text-gray-500">{meter.address}</p>}
                  {meter.isValidated && <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-2"><CheckCircle className="w-3 h-3" /> Validated</span>}
                </div>
              </div>
              <button onClick={() => handleDelete(meter._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeterManager;
