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
      const { data } = await api.get('/customer-invoices');
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const payInvoice = async (id) => {
      const invoice = invoices.find(i => i.id === id);
      const remainingAmount = Number(invoice.amountDue);
      if (remainingAmount <= 0) {
        alert('Invoice is already fully paid');
        return;
      }
      if(!window.confirm(`Register payment of ₹${remainingAmount.toLocaleString()} for this invoice?`)) return;
      try {
          await api.post('/invoice-payments', {
              customerInvoiceId: id,
              amount: remainingAmount,
              paymentMethod: 'BANK_TRANSFER'
          });
          alert('Payment recorded');
          fetchInvoices();
      } catch (err) {
          alert('Payment failed: ' + (err.message || 'Unknown error'));
      }
  };

  const confirmInvoice = async (id) => {
      if(!window.confirm('Confirm this invoice?')) return;
      try {
          await api.post(`/customer-invoices/${id}/confirm`);
          fetchInvoices();
      } catch (err) {
          alert('Failed to confirm invoice');
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap">{invoice.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{invoice.customer?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">₹{Number(invoice.total).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{Number(invoice.amountPaid || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{Number(invoice.amountDue || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' :
                    invoice.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {invoice.status === 'DRAFT' && (
                        <button 
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            onClick={() => confirmInvoice(invoice.id)}
                        >
                            Confirm
                        </button>
                    )}
                    {(invoice.status === 'CONFIRMED' || invoice.status === 'PARTIALLY_PAID') && Number(invoice.amountDue) > 0 && (
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
