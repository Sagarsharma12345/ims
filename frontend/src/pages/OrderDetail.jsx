import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { deleteOrder, getOrder } from '../api/fetchApi';
import Button from '../components/Button';
import Card from '../components/Card';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/format';

export default function OrderDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then(setOrder)
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  async function cancel() {
    if (!confirm('Cancel this order?')) return;
    try {
      await deleteOrder(id);
      showToast('Cancelled');
      setOrder(null);
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  if (loading) return <Loading />;
  if (!order) {
    return (
      <div>
        <Link to="/orders" className="text-sm text-indigo-600">Back</Link>
        <p className="mt-4 text-sm text-gray-600">Order not found.</p>
      </div>
    );
  }

  const columns = [
    { key: 'product_name', label: 'Product' },
    { key: 'product_sku', label: 'SKU' },
    { key: 'quantity', label: 'Qty' },
    { key: 'unit_price', label: 'Price', render: (r) => formatINR(r.unit_price) },
    { key: 'line_total', label: 'Amount', render: (r) => formatINR(r.line_total) },
  ];

  return (
    <div>
      <Link to="/orders" className="text-sm text-indigo-600">Back</Link>
      <PageHeader
        title={`Order #${order.id}`}
        action={<Button variant="danger" onClick={cancel}>Cancel</Button>}
      />

      <Card title="Customer">
        <div className="grid grid-cols-1 gap-4 px-4 py-3 text-sm sm:grid-cols-3">
          <p><span className="text-gray-500">ID:</span> {order.customer_id}</p>
          <p>
            <span className="text-gray-500">Name:</span>{' '}
            <Link to={`/customers/${order.customer_id}`} className="text-indigo-600">
              {order.customer_name}
            </Link>
          </p>
          <p className="break-all"><span className="text-gray-500">Email:</span> {order.customer_email}</p>
        </div>
      </Card>

      <div className="mt-4">
        <Card title="Items">
          <Table columns={columns} rows={order.items} />
        </Card>
      </div>

      <p className="mt-4 text-lg font-semibold">Total: {formatINR(order.total_amount)}</p>
    </div>
  );
}
