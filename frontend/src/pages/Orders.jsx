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

const newLine = () => ({ product_id: '', quantity: 1 });

export default function Orders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([newLine()]);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [o, c, p] = await Promise.all([getOrders(), getCustomers(), getProducts()]);
      setOrders(o);
      setCustomers(c);
      setProducts(p);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function getProduct(id) {
    return products.find((p) => String(p.id) === String(id));
  }

  let estimatedTotal = 0;
  for (const line of lines) {
    const p = getProduct(line.product_id);
    if (p) estimatedTotal += Number(p.price) * (Number(line.quantity) || 0);
  }

  async function submit(e) {
    e.preventDefault();

    if (!customerId) {
      showToast('Select customer', 'error');
      return;
    }

    const items = lines
      .filter((l) => l.product_id)
      .map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) }));

    if (!items.length) {
      showToast('Add at least one product', 'error');
      return;
    }

    const ids = items.map((i) => i.product_id);
    if (new Set(ids).size !== ids.length) {
      showToast('Duplicate product in order', 'error');
      return;
    }

    for (const item of items) {
      const p = getProduct(item.product_id);
      if (!item.quantity || item.quantity < 1) {
        showToast('Invalid quantity', 'error');
        return;
      }
      if (p && item.quantity > p.quantity_in_stock) {
        showToast(`Not enough stock for ${p.name}`, 'error');
        return;
      }
    }

    setSaving(true);
    try {
      await createOrder({ customer_id: Number(customerId), items });
      setModal(false);
      showToast('Order placed');
      load();
    } catch (ex) {
      showToast(ex.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'id', label: '#', render: (r) => r.id },
    { key: 'customer_name', label: 'Customer' },
    { key: 'total_amount', label: 'Total', render: (r) => formatINR(r.total_amount) },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex gap-3 text-sm">
          <Link to={`/orders/${r.id}`} className="text-indigo-600">View</Link>
          <button
            type="button"
            className="text-red-600"
            onClick={async () => {
              if (!confirm('Cancel this order?')) return;
              try {
                await deleteOrder(r.id);
                showToast('Cancelled');
                load();
              } catch (ex) {
                showToast(ex.message, 'error');
              }
            }}
          >
            Cancel
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Orders" action={<Button onClick={() => { setCustomerId(''); setLines([newLine()]); setModal(true); }}>New order</Button>} />
      <Card>
        <Table columns={columns} rows={orders} emptyText="No orders" />
      </Card>

      {modal && (
        <Modal title="New order" onClose={() => setModal(false)}>
          <form onSubmit={submit}>
            <Select label="Customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </Select>

            <p className="mb-2 text-sm font-medium">Items</p>
            {lines.map((line, index) => {
              const p = getProduct(line.product_id);
              const maxQty = p ? p.quantity_in_stock : 9999;
              const canRemove = lines.length > 1;

              return (
                <div
                  key={index}
                  className={`mb-2 grid items-center gap-2 ${canRemove ? 'grid-cols-[1fr_3.5rem_2rem]' : 'grid-cols-[1fr_3.5rem]'}`}
                >
                  <Select
                    bare
                    value={line.product_id}
                    onChange={(e) => {
                      const next = [...lines];
                      next[index] = { ...next[index], product_id: e.target.value };
                      setLines(next);
                    }}
                  >
                    <option value="">Select product</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id} disabled={prod.quantity_in_stock < 1}>
                        {prod.name} — {formatINR(prod.price)} (stock {prod.quantity_in_stock})
                      </option>
                    ))}
                  </Select>
                  <input
                    type="number"
                    min="1"
                    max={maxQty}
                    className="h-10 w-full rounded border px-1 text-center text-sm"
                    value={line.quantity}
                    onChange={(e) => {
                      const next = [...lines];
                      next[index] = { ...next[index], quantity: e.target.value };
                      setLines(next);
                    }}
                  />
                  {canRemove && (
                    <button
                      type="button"
                      className="text-lg text-red-600"
                      onClick={() => setLines(lines.filter((_, i) => i !== index))}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}

            <button type="button" className="mb-3 text-sm text-indigo-600" onClick={() => setLines([...lines, newLine()])}>
              + Add line
            </button>

            <p className="mb-4 font-medium">Total: {formatINR(estimatedTotal)}</p>

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
