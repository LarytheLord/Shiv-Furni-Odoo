import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2 } from 'lucide-react';

export default function Sales() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ customer_id: '', order_date: '', lines: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        api.get('/sales/orders'),
        api.get('/contacts'), 
        api.get('/products')
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data.filter(c => c.type === 'customer' || c.type === 'both'));
      setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { product_id: '', quantity: 1, unit_price: 0, analytical_account_id: null }]
    });
  };

  const updateLine = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    
    if (field === 'product_id') {
      const product = products.find(p => p.id == value);
      if (product) {
        newLines[index].unit_price = product.selling_price; // use selling price for SO
      }
    }
    setFormData({ ...formData, lines: newLines });
  };

  const removeLine = (index) => {
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.lines.length === 0) return alert('Add at least one product');
      await api.post('/sales/orders', formData);
      setShowModal(false);
      setFormData({ customer_id: '', order_date: '', lines: [] });
      fetchData();
    } catch (err) {
      alert('Failed to create order');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sales Orders</h2>
        <button
          onClick={() => {
              setFormData({ customer_id: '', order_date: new Date().toISOString().split('T')[0], lines: [] });
              setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Create SO
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">SO-{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.customer_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(order.order_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">${order.total_amount}</td>
                <td className="px-6 py-4 whitespace-nowrap uppercase text-sm">{order.state}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {order.state === 'draft' && (
                        <button 
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            onClick={async () => {
                                if(window.confirm('Confirm this SO?')) {
                                    await api.post(`/sales/orders/${order.id}/confirm`);
                                    fetchData();
                                }
                            }}
                        >
                            Confirm
                        </button>
                    )}
                    {order.state === 'confirmed' && (
                        <button 
                            className="text-green-600 hover:text-green-900 text-sm font-medium ml-2"
                            onClick={async () => {
                                if(window.confirm('Create Invoice from this SO?')) {
                                    await api.post(`/sales/invoices/from-so`, { sales_order_id: order.id });
                                    alert('Invoice created!');
                                }
                            }}
                        >
                            Create Invoice
                        </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl my-8">
            <h3 className="text-lg font-bold mb-4">Create Sales Order</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <select
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                      value={formData.customer_id}
                      onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    >
                      <option value="">Select Customer</option>
                      {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Date</label>
                    <input
                      type="date"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                      value={formData.order_date}
                      onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                    />
                  </div>
              </div>
              
              <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Order Lines</h4>
                    <button type="button" onClick={addLine} className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                        <Plus size={14} className="mr-1"/> Add Product
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                      {formData.lines.map((line, index) => (
                          <div key={index} className="flex gap-2 items-end bg-gray-50 p-2 rounded">
                              <div className="flex-1">
                                  <label className="block text-xs text-gray-500">Product</label>
                                  <select 
                                      className="w-full text-sm border-gray-300 rounded"
                                      value={line.product_id}
                                      onChange={(e) => updateLine(index, 'product_id', e.target.value)}
                                      required
                                  >
                                      <option value="">Select</option>
                                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                  </select>
                              </div>
                              <div className="w-20">
                                  <label className="block text-xs text-gray-500">Qty</label>
                                  <input 
                                      type="number" 
                                      className="w-full text-sm border-gray-300 rounded"
                                      value={line.quantity}
                                      onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                                      min="1" required
                                  />
                              </div>
                              <div className="w-24">
                                  <label className="block text-xs text-gray-500">Price</label>
                                  <input 
                                      type="number" 
                                      className="w-full text-sm border-gray-300 rounded"
                                      value={line.unit_price}
                                      onChange={(e) => updateLine(index, 'unit_price', e.target.value)}
                                      min="0" required
                                  />
                              </div>
                              <button type="button" onClick={() => removeLine(index)} className="text-red-500 p-2">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
