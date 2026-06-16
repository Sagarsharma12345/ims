import { useEffect, useState } from "react";
import { createCustomer, deleteCustomer, getCustomers } from "../api/fetchApi";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";
import { Trash2, UserPlus } from "lucide-react";

const empty = { full_name: "", email: "", phone: "" };

export default function Customers() {
  const { showToast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () =>
    getCustomers()
      .then(setList)
      .catch((e) => showToast(e.message, "error"))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

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
      setForm(empty);
      showToast("Saved");
      load();
    } catch (ex) {
      showToast(ex.message, "error");
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
            if (!confirm("Delete customer?")) return;

            try {
              await deleteCustomer(r.id);
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
            <span className="flex items-center gap-2">
              <UserPlus size={16} />
              Add Customer
            </span>
          </Button>
        }
      />
      <Card>
        <Table columns={columns} rows={list} emptyText="No customers yet" />
      </Card>

      {modal && (
        <Modal title="Add customer" onClose={() => setModal(false)}>
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
