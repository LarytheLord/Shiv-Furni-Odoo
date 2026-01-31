import React, { useState } from 'react';
import ListView from '../../components/ui/ListView';

export default function Products() {
  const [data] = useState([
    {
      id: 1,
      name: 'Office Chair',
      ref: 'FURN-001',
      category: 'Office Furniture',
      price: 120.0,
      stock: 45,
      status: 'Active',
    },
    {
      id: 2,
      name: 'Corner Desk Right Sit',
      ref: 'FURN-002',
      category: 'Office Furniture',
      price: 350.0,
      stock: 12,
      status: 'Active',
    },
    {
      id: 3,
      name: 'Drawer Element',
      ref: 'FURN-003',
      category: 'Components',
      price: 45.0,
      stock: 150,
      status: 'Active',
    },
    {
      id: 4,
      name: 'Large Cabinet',
      ref: 'FURN-004',
      category: 'Office Furniture',
      price: 280.0,
      stock: 8,
      status: 'Active',
    },
    {
      id: 5,
      name: 'Acoustic Bloc Screens',
      ref: 'MISC-001',
      category: 'Misc',
      price: 95.0,
      stock: 0,
      status: 'Out of Stock',
    },
  ]);

  const columns = [
    { header: 'Internal Reference', accessor: 'ref', width: '150px' },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <span className='font-medium text-slate-800'>{row.name}</span>
      ),
    },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Sales Price',
      accessor: 'price',
      render: (row) => `$${row.price.toFixed(2)}`,
    },
    {
      header: 'On Hand',
      accessor: 'stock',
      render: (row) => (
        <span
          className={
            row.stock === 0 ? 'text-red-500 font-bold' : 'text-slate-900'
          }
        >
          {row.stock} Units
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            backgroundColor: row.status === 'Active' ? '#dcfce7' : '#fee2e2',
            color: row.status === 'Active' ? '#166534' : '#dc2626',
          }}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <ListView
      title='Products'
      columns={columns}
      data={data}
      pagination={{ page: 1, limit: 10, total: 5 }}
      onCreate={() => console.log('Create Product')}
      onSearch={(val) => console.log('Searching:', val)}
    />
  );
}
