import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics/budget-vs-actuals');
      setData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Budget vs Actuals Analysis</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="analytical_account" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget_amount" fill="#8884d8" name="Budget" />
                <Bar dataKey="actual_expense" fill="#82ca9d" name="Actual Expense" />
                <Bar dataKey="actual_income" fill="#ffc658" name="Actual Income" />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analytical Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Expense</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Income</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance (Exp)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Used</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.budget_id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.analytical_account}</td>
                <td className="px-6 py-4 whitespace-nowrap">${item.budget_amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">${item.actual_expense}</td>
                <td className="px-6 py-4 whitespace-nowrap">${item.actual_income}</td>
                <td className={`px-6 py-4 whitespace-nowrap font-bold ${item.variance_expense < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${item.variance_expense}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {item.achievement_expense_pct.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
