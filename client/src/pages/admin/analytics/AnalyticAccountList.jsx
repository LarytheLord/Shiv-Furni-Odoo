import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListView from '../../../components/ui/ListView';
import api from '../../../api/axios';

const SkeletonRow = () => (
  <tr className='animate-pulse'>
    <td className='px-6 py-4'>
      <div className='h-4 bg-slate-200 rounded w-48'></div>
    </td>
  </tr>
);

const TableSkeleton = () => (
  <div className='bg-white rounded-lg border border-slate-200 overflow-hidden'>
    <div className='px-6 py-4 border-b border-slate-200 flex justify-between items-center'>
      <div className='h-6 bg-slate-200 rounded w-40 animate-pulse'></div>
      <div className='h-9 bg-slate-200 rounded w-24 animate-pulse'></div>
    </div>
    <table className='w-full'>
      <thead className='bg-slate-50'>
        <tr>
          <th className='px-6 py-3 text-left'>
            <div className='h-4 bg-slate-200 rounded w-16 animate-pulse'></div>
          </th>
        </tr>
      </thead>
      <tbody className='divide-y divide-slate-100'>
        {[...Array(5)].map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </tbody>
    </table>
  </div>
);

export default function AnalyticAccountList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytical-accounts');
      const accounts =
        response.data?.data?.accounts || response.data?.accounts || [];
      setData(accounts);
    } catch (error) {
      console.error('Failed to fetch analytical accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <span
          className='font-medium text-slate-700 cursor-pointer hover:text-accent-600'
          onClick={() => navigate(`/admin/analytics/${row.id}`)}
        >
          {row.name}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className='p-6'>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <ListView
      title='Analytic Accounts'
      columns={columns}
      data={data}
      loading={loading}
      pagination={{ page: 1, limit: 10, total: data.length }}
      onCreate={() => navigate('/admin/analytics/new')}
    />
  );
}
