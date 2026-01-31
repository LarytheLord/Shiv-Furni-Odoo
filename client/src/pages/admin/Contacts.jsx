import React, { useState } from 'react';
import ListView from '../../components/ui/ListView';

export default function Contacts() {
  const [data] = useState([
    {
      id: 1,
      name: 'Azure Interior',
      type: 'Company',
      taxId: 'US12345678',
      email: 'info@azure-interior.com',
      phone: '+1 555-0123',
      city: 'San Francisco',
      country: 'United States',
    },
    {
      id: 2,
      name: 'Brandon Freeman',
      type: 'Individual',
      taxId: '-',
      email: 'b.freeman@gemini.com',
      phone: '+1 555-0199',
      city: 'New York',
      country: 'United States',
    },
    {
      id: 3,
      name: 'Colleen Diaz',
      type: 'Individual',
      taxId: '-',
      email: 'colleen.d@example.com',
      phone: '+1 555-0155',
      city: 'Los Angeles',
      country: 'United States',
    },
    {
      id: 4,
      name: 'Deco Addict',
      type: 'Company',
      taxId: 'US87654321',
      email: 'support@decoaddict.com',
      phone: '+1 555-0188',
      city: 'Chicago',
      country: 'United States',
    },
    {
      id: 5,
      name: 'Furniture Co',
      type: 'Company',
      taxId: 'UK98765432',
      email: 'contact@furnitureco.uk',
      phone: '+44 20 7123 4567',
      city: 'London',
      country: 'United Kingdom',
    },
  ]);

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <span className='font-medium text-slate-800'>{row.name}</span>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <span
          className={`badge ${row.type === 'Company' ? 'badge-primary' : 'badge-secondary'}`}
        >
          {row.type}
        </span>
      ),
    },
    { header: 'Tax ID', accessor: 'taxId' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'City', accessor: 'city' },
    { header: 'Country', accessor: 'country' },
  ];

  return (
    <ListView
      title='Contacts'
      columns={columns}
      data={data}
      pagination={{ page: 1, limit: 10, total: 5 }}
      onCreate={() => console.log('Create Contact')}
      onSearch={(val) => console.log('Searching:', val)}
    />
  );
}
