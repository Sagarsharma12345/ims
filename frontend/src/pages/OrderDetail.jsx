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

  if (loading) return <Loading />;
  if (!order) return <p className="text-sm text-gray-600">Order not found</p>;

  const columns = [
    { key: 'product_name', label: 'Product' },
    { key: 'quantity', label: 'Qty' },
    { key: 'unit_price', label: 'Price', render: (r) => formatINR(r.unit_price) },
    { key: 'line_total', label: 'Amount', render: (r) => formatINR(r.line_total) },
  ];

  return (
    <div>
      <Link to="/orders" className="text-sm text-indigo-600">Back</Link>
      <PageHeader
        title={`Order #${order.id}`}
        action={
          <Button
            variant="danger"
            onClick={async () => {
              if (!confirm('Cancel order?')) return;
              try {
                await deleteOrder(id);
                showToast('Cancelled');
                setOrder(null);
              } catch (e) {
                showToast(e.message, 'error');
              }
            }}
          >
            Cancel
          </Button>
        }
      />

      <p className="mb-4 text-sm">
        Customer: {order.customer_name} ({order.customer_email})
      </p>

      <Card title="Items">
        <Table columns={columns} rows={order.items} />
      </Card>

      <p className="mt-4 font-semibold">Total: {formatINR(order.total_amount)}</p>
    </div>
  );
}
