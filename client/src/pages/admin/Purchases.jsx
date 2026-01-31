import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2 } from 'lucide-react';

export default function Purchases() {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ vendorId: '', orderDate: '', lines: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, vendorsRes, productsRes] = await Promise.all([
        api.get('/purchase-orders'),
        api.get('/contacts/vendors'),
        api.get('/products')
      ]);
      setOrders(ordersRes.data.orders || []);
      setVendors(vendorsRes.data.vendors || vendorsRes.data || []);
      setProducts(productsRes.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { productId: '', quantity: 1, unitPrice: 0, taxRate: 0 }]
    });
  };

  const updateLine = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    
    // Auto-fill price if product selected
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newLines[index].unitPrice = product.costPrice || 0;
        newLines[index].taxRate = product.taxRate || 0;
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
      await api.post('/purchase-orders', formData);
      setShowModal(false);
      setFormData({ vendorId: '', orderDate: '', lines: [] });
      fetchData();
    } catch (err) {
      alert('Failed to create order');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Purchase Orders</h2>
        <button
          onClick={() => {
              setFormData({ vendorId: '', orderDate: new Date().toISOString().split('T')[0], lines: [] });
              setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Create PO
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">{order.poNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.vendor?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(order.orderDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">₹{Number(order.total).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap uppercase text-sm">{order.status}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {order.status === 'DRAFT' && (
                        <button 
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            onClick={async () => {
                                if(window.confirm('Confirm this PO?')) {
                                    await api.post(`/purchase-orders/${order.id}/confirm`);
                                    fetchData();
                                }
                            }}
                        >
                            Confirm
                        </button>
                    )}
                    {order.status === 'CONFIRMED' && (
                        <button 
                            className="text-green-600 hover:text-green-900 text-sm font-medium ml-2"
                            onClick={async () => {
                                const dueDate = prompt('Enter due date (YYYY-MM-DD):', new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]);
                                if(dueDate) {
                                    await api.post(`/purchase-orders/${order.id}/create-bill`, { dueDate });
                                    alert('Bill created!');
                                    fetchData();
                                }
                            }}
                        >
                            Create Bill
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
            <h3 className="text-lg font-bold mb-4">Create Purchase Order</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vendor</label>
                    <select
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                      value={formData.vendorId}
                      onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Date</label>
                    <input
                      type="date"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
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
                                      value={line.productId}
                                      onChange={(e) => updateLine(index, 'productId', e.target.value)}
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
                                      onChange={(e) => updateLine(index, 'quantity', parseInt(e.target.value))}
                                      min="1" required
                                  />
                              </div>
                              <div className="w-24">
                                  <label className="block text-xs text-gray-500">Price</label>
                                  <input 
                                      type="number" 
                                      className="w-full text-sm border-gray-300 rounded"
                                      value={line.unitPrice}
                                      onChange={(e) => updateLine(index, 'unitPrice', parseFloat(e.target.value))}
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
