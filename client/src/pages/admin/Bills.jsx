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
      const { data } = await api.get('/vendor-bills');
      setBills(data.bills || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const payBill = async (id) => {
      const bill = bills.find(b => b.id === id);
      const remainingAmount = Number(bill.amountDue);
      if (remainingAmount <= 0) {
        alert('Bill is already fully paid');
        return;
      }
      if(!window.confirm(`Pay ₹${remainingAmount.toLocaleString()} for this bill?`)) return;
      try {
          await api.post('/bill-payments', {
              vendorBillId: id,
              amount: remainingAmount,
              paymentMethod: 'BANK_TRANSFER'
          });
          alert('Payment recorded');
          fetchBills();
      } catch (err) {
          alert('Payment failed: ' + (err.message || 'Unknown error'));
      }
  };

  const confirmBill = async (id) => {
      if(!window.confirm('Confirm this bill?')) return;
      try {
          await api.post(`/vendor-bills/${id}/confirm`);
          fetchBills();
      } catch (err) {
          alert('Failed to confirm bill');
      }
  };

  const getPaymentStatus = (bill) => {
    if (bill.status === 'PAID') return 'paid';
    if (bill.status === 'PARTIALLY_PAID') return 'partial';
    if (Number(bill.amountPaid) > 0) return 'partial';
    return 'unpaid';
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bills.map((bill) => (
              <tr key={bill.id}>
                <td className="px-6 py-4 whitespace-nowrap">{bill.billNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bill.vendor?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(bill.billDate || bill.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">₹{Number(bill.total).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{Number(bill.amountPaid || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{Number(bill.amountDue || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    bill.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    bill.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' :
                    bill.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {bill.status === 'DRAFT' && (
                        <button 
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            onClick={() => confirmBill(bill.id)}
                        >
                            Confirm
                        </button>
                    )}
                    {(bill.status === 'CONFIRMED' || bill.status === 'PARTIALLY_PAID') && Number(bill.amountDue) > 0 && (
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
