import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data } = await api.get('/sales/invoices');
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const payInvoice = async (id, amount) => {
      // Simplistic payment flow for demo: Receive full amount
      if(!window.confirm('Register full payment for this invoice?')) return;
      try {
          const invoice = invoices.find(i => i.id === id);
          await api.post('/payments', {
              type: 'inbound',
              partner_id: invoice.customer_id,
              amount: invoice.total_amount - (invoice.paid_amount || 0),
              invoice_id: id,
              reference: `PAY-INV-${id}`
          });
          alert('Payment recorded');
          fetchInvoices();
      } catch (err) {
          alert('Payment failed');
      }
  };

  const postInvoice = async (id) => {
      if(!window.confirm('Post this invoice to update actuals?')) return;
      try {
          await api.post(`/sales/invoices/${id}/post`);
          fetchInvoices();
      } catch (err) {
          alert('Failed to post invoice');
      }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customer Invoices</h2>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap">INV-{invoice.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{invoice.customer_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">${invoice.total_amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">${invoice.paid_amount || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{invoice.payment_status}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{invoice.state}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {invoice.state === 'draft' && (
                        <button 
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            onClick={() => postInvoice(invoice.id)}
                        >
                            Post
                        </button>
                    )}
                    {invoice.state === 'posted' && invoice.payment_status !== 'paid' && (
                        <button 
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                            onClick={() => payInvoice(invoice.id)}
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
