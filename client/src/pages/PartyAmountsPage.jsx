import React, { useEffect, useState } from 'react';
import partyAmountAPI from '../utils/partyAmountAPI';

const PartyAmountsPage = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [files, setFiles] = useState(null);

  useEffect(() => {
    setLoading(true);
    partyAmountAPI.getActive()
      .then(data => setParties(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const openSubmit = (party) => {
    setSelectedParty(party);
  };

  const handleFileChange = (e) => setFiles(e.target.files);

  const submitPayment = async () => {
    if (!selectedParty || !files || files.length === 0) return alert('Select a file');
    const fd = new FormData();
    fd.append('partyId', selectedParty._id);
    for (let i = 0; i < files.length; i++) fd.append('paymentProofs', files[i]);

    try {
      await partyAmountAPI.submitPayment(fd);
      alert('Payment submitted');
      setSelectedParty(null);
      setFiles(null);
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Error submitting payment');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Party Contributions</h2>
      {loading && <div>Loading...</div>}
      {!loading && parties.length === 0 && <div>No active parties</div>}
      <div className="space-y-4">
        {parties.map(p => (
          <div key={p._id} className="p-4 border rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{p.partyName}</div>
                <div className="text-sm text-gray-500">Amount per member: {p.amountPerMember || p.amounts?.year1 || '—'}</div>
              </div>
              <div>
                <button onClick={() => openSubmit(p)} className="px-3 py-1 bg-green-600 text-white rounded-md">Pay</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple modal for submit */}
      {selectedParty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md w-full max-w-xl">
            <h3 className="font-semibold mb-3">Submit payment for {selectedParty.partyName}</h3>
            <input type="file" multiple onChange={handleFileChange} className="mb-3" />
            <div className="flex space-x-3">
              <button onClick={submitPayment} className="px-3 py-2 bg-blue-600 text-white rounded-md">Submit</button>
              <button onClick={() => setSelectedParty(null)} className="px-3 py-2 bg-gray-200 rounded-md">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyAmountsPage;
