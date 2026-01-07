import React, { useEffect, useState } from 'react';
import partyAmountAPI from '../utils/partyAmountAPI';

const PartyAdminPage = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    setLoading(true);
    partyAmountAPI.getAll()
      .then(data => setParties(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const viewPayments = async (party) => {
    setSelected(party);
    try {
      const data = await partyAmountAPI.getPartyPayments(party._id);
      setPayments(data);
    } catch (err) {
      console.error(err);
      alert('Unable to load payments');
    }
  };

  const verify = async (paymentId, action) => {
    try {
      await partyAmountAPI.verifyPayment({ paymentId, action });
      alert('Updated');
      // refresh
      if (selected) {
        const data = await partyAmountAPI.getPartyPayments(selected._id);
        setPayments(data);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating payment');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Party Admin</h2>
      {loading && <div>Loading...</div>}
      <div className="space-y-3">
        {parties.map(p => (
          <div key={p._id} className="p-3 border rounded-md flex justify-between items-center">
            <div>
              <div className="font-semibold">{p.partyName}</div>
              <div className="text-sm text-gray-500">Collected: {p.totalCollected}</div>
            </div>
            <div>
              <button onClick={() => viewPayments(p)} className="px-3 py-1 bg-indigo-600 text-white rounded-md">View Payments</button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-6">
          <h3 className="font-semibold">Payments for {selected.partyName}</h3>
          <div className="space-y-3 mt-3">
            {payments.map(pay => (
              <div key={pay._id} className="p-3 border rounded-md flex justify-between items-center">
                <div>
                  <div className="font-semibold">{pay.member?.name || '—'}</div>
                  <div className="text-sm text-gray-500">Amount: {pay.amount} • Status: {pay.status}</div>
                </div>
                <div className="flex space-x-2">
                  {pay.status !== 'Paid' && <button onClick={() => verify(pay._id, 'mark-paid')} className="px-2 py-1 bg-green-600 text-white rounded-md">Mark Paid</button>}
                  {pay.status !== 'Rejected' && <button onClick={() => verify(pay._id, 'reject')} className="px-2 py-1 bg-red-600 text-white rounded-md">Reject</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyAdminPage;
