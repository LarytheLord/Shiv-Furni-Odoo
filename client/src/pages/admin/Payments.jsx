import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // Fetch both bill payments and invoice payments
      const [billPaymentsRes, invoicePaymentsRes] = await Promise.all([
        api.get('/bill-payments'),
        api.get('/invoice-payments')
      ]);

      // Combine and normalize payments
      const billPayments = (billPaymentsRes.data.payments || []).map(p => ({
        ...p,
        type: 'outbound',
        partnerName: p.vendorBill?.vendor?.name || 'Unknown Vendor',
        reference: p.paymentNumber,
        linkedDocument: `Bill: ${p.vendorBill?.billNumber || 'N/A'}`
      }));

      const invoicePayments = (invoicePaymentsRes.data.payments || []).map(p => ({
        ...p,
        type: 'inbound',
        partnerName: p.customerInvoice?.customer?.name || 'Unknown Customer',
        reference: p.paymentNumber,
        linkedDocument: `Invoice: ${p.customerInvoice?.invoiceNumber || 'N/A'}`
      }));

      // Combine and sort by date (newest first)
      const allPayments = [...billPayments, ...invoicePayments].sort(
        (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
      );

      setPayments(allPayments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payments History</h2>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={`${payment.type}-${payment.id}`}>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.reference}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.partnerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.linkedDocument}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.type === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {payment.type === 'inbound' ? 'Received' : 'Paid'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{payment.paymentMethod?.replace('_', ' ')}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">₹{Number(payment.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <div className="text-center py-8 text-gray-500">No payments recorded yet</div>
        )}
      </div>
    </div>
  );
}
