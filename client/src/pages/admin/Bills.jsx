import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data } = await api.get('/purchases/bills'); // Assuming backend route is /purchases/bills
      setBills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const payBill = async (id, amount) => {
      // Simplistic payment flow for demo: Pay full amount
      if(!window.confirm('Pay this bill in full?')) return;
      try {
          // Find bill to get vendor and amount
          const bill = bills.find(b => b.id === id);
          await api.post('/payments', {
              type: 'outbound',
              partner_id: bill.vendor_id,
              amount: bill.total_amount - (bill.paid_amount || 0), // Pay remaining
              bill_id: id,
              reference: `PAY-BILL-${id}`
          });
          alert('Payment recorded');
          fetchBills();
      } catch (err) {
          alert('Payment failed');
      }
  };

  const postBill = async (id) => {
      if(!window.confirm('Post this bill to update actuals?')) return;
      try {
          await api.post(`/purchases/bills/${id}/post`);
          fetchBills();
      } catch (err) {
          alert('Failed to post bill');
      }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Vendor Bills</h2>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bills.map((bill) => (
              <tr key={bill.id}>
                <td className="px-6 py-4 whitespace-nowrap">BILL-{bill.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bill.vendor_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(bill.bill_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">${bill.total_amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">${bill.paid_amount || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{bill.payment_status}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{bill.state}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {bill.state === 'draft' && (
                        <button 
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            onClick={() => postBill(bill.id)}
                        >
                            Post
                        </button>
                    )}
                    {bill.state === 'posted' && bill.payment_status !== 'paid' && (
                        <button 
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                            onClick={() => payBill(bill.id)}
                        >
                            Register Payment
                        </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
