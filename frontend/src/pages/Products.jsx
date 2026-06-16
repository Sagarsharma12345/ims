import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../api/fetchApi";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";
import { formatINR } from "../utils/format";
import { Pencil, Plus, Trash2 } from "lucide-react";

const empty = { name: "", sku: "", price: "", quantity_in_stock: "" };

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
      .catch((e) => showToast(e.message, "error"))
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
    if (!form.name.trim()) err.name = "Required";
    if (!form.sku.trim()) err.sku = "Required";
    if (!form.price || Number(form.price) <= 0) err.price = "Invalid";
    if (form.quantity_in_stock === "" || Number(form.quantity_in_stock) < 0)
      err.stock = "Invalid";
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
      showToast(editId ? "Updated" : "Saved");
      load();
    } catch (ex) {
      showToast(ex.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "sku", label: "SKU" },
    { key: "price", label: "Price", render: (r) => formatINR(r.price) },
    {
      key: "quantity_in_stock",
      label: "Stock",
      render: (r) => <StatusBadge stock={r.quantity_in_stock} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <button
            type="button"
            onClick={() => openEdit(r)}
            className="flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
          >
            <Pencil size={14} />
            Edit
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!confirm("Delete product?")) return;

              try {
                await deleteProduct(r.id);
                showToast("Deleted");
                load();
              } catch (ex) {
                showToast(ex.message, "error");
              }
            }}
            className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Products"
        action={
          <Button onClick={openAdd}>
            <span className="flex items-center gap-2">
              <Plus size={16} />
              Add Product
            </span>
          </Button>
        }
      />
      <Card>
        <Table columns={columns} rows={list} emptyText="No products" />
      </Card>

      {modal && (
        <Modal
          title={editId ? "Edit product" : "Add product"}
          onClose={() => setModal(false)}
        >
          <form onSubmit={save}>
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
            <Input
              label="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              error={errors.sku}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price (₹)"
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                error={errors.price}
              />
              <Input
                label="Stock"
                type="number"
                min="0"
                value={form.quantity_in_stock}
                onChange={(e) =>
                  setForm({ ...form, quantity_in_stock: e.target.value })
                }
                error={errors.stock}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
