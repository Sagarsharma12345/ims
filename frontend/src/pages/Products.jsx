import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../api/fetchApi';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/format';

const empty = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function Products() {
  const { showToast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () =>
    getProducts()
      .then(setList)
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(empty);
    setErrors({});
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      name: row.name,
      sku: row.sku,
      price: String(row.price),
      quantity_in_stock: String(row.quantity_in_stock),
    });
    setErrors({});
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = 'Required';
    if (!form.sku.trim()) err.sku = 'Required';
    if (!form.price || Number(form.price) <= 0) err.price = 'Invalid';
    if (form.quantity_in_stock === '' || Number(form.quantity_in_stock) < 0) err.stock = 'Invalid';
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        quantity_in_stock: Number(form.quantity_in_stock),
      };
      if (editId) await updateProduct(editId, body);
      else await createProduct(body);
      setModal(false);
      showToast(editId ? 'Updated' : 'Saved');
      load();
    } catch (ex) {
      showToast(ex.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'price', label: 'Price', render: (r) => formatINR(r.price) },
    { key: 'quantity_in_stock', label: 'Stock', render: (r) => <StatusBadge stock={r.quantity_in_stock} /> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex gap-2 text-sm">
          <Link to={`/products/${r.id}`} className="text-indigo-600">View</Link>
          <button type="button" className="text-indigo-600" onClick={() => openEdit(r)}>Edit</button>
          <button type="button" className="text-red-600" onClick={async () => {
            if (!confirm('Delete?')) return;
            try {
              await deleteProduct(r.id);
              showToast('Deleted');
              load();
            } catch (ex) {
              showToast(ex.message, 'error');
            }
          }}>Delete</button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Products" action={<Button onClick={openAdd}>Add product</Button>} />
      <Card>
        <Table columns={columns} rows={list} emptyText="No products" />
      </Card>

      {modal && (
        <Modal title={editId ? 'Edit product' : 'Add product'} onClose={() => setModal(false)}>
          <form onSubmit={save}>
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
            <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} error={errors.sku} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price (₹)" type="number" min="0" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} error={errors.price} />
              <Input label="Stock" type="number" min="0" value={form.quantity_in_stock} onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })} error={errors.stock} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
