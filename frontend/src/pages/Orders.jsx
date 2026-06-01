import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createOrder, deleteOrder, getCustomers, getOrders, getProducts } from '../api/fetchApi';
import Button from '../components/Button';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import Select from '../components/Select';
import Table from '../components/Table';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/format';

export default function Orders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([{ product_id: '', quantity: 1 }]);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => {
        setOrders(o);
        setCustomers(c);
        setProducts(p);
      })
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const total = lines.reduce((sum, line) => {
    const p = products.find((x) => String(x.id) === String(line.product_id));
    return p ? sum + Number(p.price) * Number(line.quantity || 0) : sum;
  }, 0);

  const save = async (e) => {
    e.preventDefault();
    if (!customerId) return showToast('Select customer', 'error');

    const items = lines
      .filter((l) => l.product_id)
      .map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) }));

    if (!items.length) return showToast('Add product', 'error');

    setSaving(true);
    try {
      await createOrder({ customer_id: Number(customerId), items });
      setModal(false);
      showToast('Order placed');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Orders" action={<Button onClick={() => setModal(true)}>New order</Button>} />
      <Card>
        <Table
          columns={[
            { key: 'id', label: '#', render: (r) => r.id },
            { key: 'customer_name', label: 'Customer' },
            { key: 'total_amount', label: 'Total', render: (r) => formatINR(r.total_amount) },
            {
              key: 'x',
              label: '',
              render: (r) => (
                <div className="flex gap-2 text-sm">
                  <Link to={`/orders/${r.id}`} className="text-indigo-600">View</Link>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={async () => {
                      if (!confirm('Cancel?')) return;
                      try {
                        await deleteOrder(r.id);
                        showToast('Cancelled');
                        load();
                      } catch (e) {
                        showToast(e.message, 'error');
                      }
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ),
            },
          ]}
          rows={orders}
          emptyText="No orders"
        />
      </Card>

      {modal && (
        <Modal title="New order" onClose={() => setModal(false)}>
          <form onSubmit={save}>
            <Select label="Customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </Select>

            {lines.map((line, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <select
                  className="flex-1 rounded border px-2 py-2 text-sm"
                  value={line.product_id}
                  onChange={(e) => {
                    const copy = [...lines];
                    copy[i].product_id = e.target.value;
                    setLines(copy);
                  }}
                >
                  <option value="">Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatINR(p.price)} (stock {p.quantity_in_stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="w-16 rounded border px-2 py-2 text-sm"
                  value={line.quantity}
                  onChange={(e) => {
                    const copy = [...lines];
                    copy[i].quantity = e.target.value;
                    setLines(copy);
                  }}
                />
                {lines.length > 1 && (
                  <button type="button" className="text-red-600" onClick={() => setLines(lines.filter((_, j) => j !== i))}>
                    x
                  </button>
                )}
              </div>
            ))}

            <button type="button" className="mb-3 text-sm text-indigo-600" onClick={() => setLines([...lines, { product_id: '', quantity: 1 }])}>
              + Add item
            </button>

            <p className="mb-4 font-medium">Total: {formatINR(total)}</p>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Place order'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
