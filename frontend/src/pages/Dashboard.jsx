import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/fetchApi';
import Card from '../components/Card';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/format';

export default function Dashboard() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data) return null;

  const columns = [
    { key: 'name', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'quantity_in_stock', label: 'Stock', render: (r) => <StatusBadge stock={r.quantity_in_stock} /> },
    { key: 'price', label: 'Price', render: (r) => formatINR(r.price) },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded border bg-white p-3">
          <p className="text-gray-500">Products</p>
          <p className="text-xl font-bold">{data.total_products}</p>
        </div>
        <div className="rounded border bg-white p-3">
          <p className="text-gray-500">Customers</p>
          <p className="text-xl font-bold">{data.total_customers}</p>
        </div>
        <div className="rounded border bg-white p-3">
          <p className="text-gray-500">Orders</p>
          <p className="text-xl font-bold">{data.total_orders}</p>
        </div>
      </div>

      <Card title="Low stock">
        <Table columns={columns} rows={data.low_stock_products} emptyText="Nothing low" />
      </Card>
      <Link to="/products" className="mt-2 inline-block text-sm text-indigo-600">
        Products →
      </Link>
    </div>
  );
}
