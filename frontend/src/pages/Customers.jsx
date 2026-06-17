import { useEffect, useState } from "react";
import { createCustomer, deleteCustomer, getCustomers } from "../api/fetchApi";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import SearchBox from "../components/SearchBox";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";
import { filterSortPage } from "../utils/tableHelpers";
import { Trash2, UserPlus } from "lucide-react";

const emptyForm = { full_name: "", email: "", phone: "" };

export default function Customers() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("full_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getCustomers()
      .then(setCustomers)
      .catch((e) => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const table = filterSortPage(customers, {
    search,
    keys: ["full_name", "email", "phone"],
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

  const save = async (e) => {
    e.preventDefault();
    const err = {};
    if (!form.full_name.trim()) err.full_name = "Required";
    if (!form.email.trim()) err.email = "Required";
    if (!form.phone.trim()) err.phone = "Required";
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      await createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      setModal(false);
      setForm(emptyForm);
      showToast("Saved");
      load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <button
          type="button"
          onClick={async () => {
            if (!confirm("Delete?")) return;
            try {
              await deleteCustomer(r.id);
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
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Customers"
        action={
          <Button onClick={() => setModal(true)}>
            <UserPlus size={16} className="inline" /> Add Customer
          </Button>
        }
      />

      <Card>
        <div className="border-b border-slate-100 p-3 sm:p-4">
          <SearchBox
            value={search}
            onChange={onSearch}
            placeholder="Search name, email, phone"
          />
        </div>

        <Table
          columns={columns}
          rows={table.rows}
          emptyText="No customers"
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
        <Modal title="Add Customer" onClose={() => setModal(false)}>
          <form onSubmit={save}>
            <Input
              label="Name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              error={errors.full_name}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone}
            />
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
