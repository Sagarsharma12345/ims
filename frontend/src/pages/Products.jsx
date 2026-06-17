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
import Pagination from "../components/Pagination";
import SearchBox from "../components/SearchBox";
import StatusBadge from "../components/StatusBadge";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";
import { formatINR } from "../utils/format";
import { filterSortPage } from "../utils/tableHelpers";
import { Pencil, Plus, Trash2 } from "lucide-react";

const emptyForm = { name: "", sku: "", price: "", quantity_in_stock: "" };

export default function Products() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch((e) => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const table = filterSortPage(products, {
    search,
    keys: ["name", "sku"],
    sortKey,
    sortOrder,
    page,
  });

  const onSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const onSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
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
    if (form.quantity_in_stock === "" || Number(form.quantity_in_stock) < 0) {
      err.stock = "Invalid";
    }
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
    } catch (e) {
      showToast(e.message, "error");
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(r)}
            className="rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs text-indigo-600"
          >
            <Pencil size={14} className="inline" /> Edit
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Delete?")) return;
              try {
                await deleteProduct(r.id);
                showToast("Deleted");
                load();
              } catch (e) {
                showToast(e.message, "error");
              }
            }}
            className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600"
          >
            <Trash2 size={14} className="inline" /> Delete
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
            <Plus size={16} className="inline" /> Add Product
          </Button>
        }
      />

      <Card>
        <div className="border-b border-slate-100 p-3 sm:p-4">
          <SearchBox
            value={search}
            onChange={onSearch}
            placeholder="Search Name or SKU"
          />
        </div>

        <Table
          columns={columns}
          rows={table.rows}
          emptyText="No products"
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={onSort}
          page={table.page}
        />
        <Pagination
          page={table.page}
          pages={table.pages}
          total={table.total}
          onPage={setPage}
        />
      </Card>

      {modal && (
        <Modal
          title={editId ? "Edit Product" : "Add Product"}
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Price"
                type="number"
                min="0"
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
