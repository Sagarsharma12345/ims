import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createOrder,
  deleteOrder,
  getCustomers,
  getOrders,
  getProducts,
} from "../api/fetchApi";
import Button from "../components/Button";
import Card from "../components/Card";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import Select from "../components/Select";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";
import { formatINR } from "../utils/format";
import { Ban, Eye, Plus, Trash2 } from "lucide-react";

export default function Orders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ product_id: "", quantity: 1 }]);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => {
        setOrders(o);
        setCustomers(c);
        setProducts(p);
      })
      .catch((e) => showToast(e.message, "error"))
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
    if (!customerId) return showToast("Select customer", "error");

    const items = lines
      .filter((l) => l.product_id)
      .map((l) => ({
        product_id: Number(l.product_id),
        quantity: Number(l.quantity),
      }));

    if (!items.length) return showToast("Add product", "error");

    setSaving(true);
    try {
      await createOrder({ customer_id: Number(customerId), items });
      setModal(false);
      showToast("Order placed");
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Orders"
        action={
          <Button onClick={() => setModal(true)}>
            <span className="flex items-center gap-2">
              <Plus size={16} />
              New Order
            </span>
          </Button>
        }
      />
      <Card>
        <Table
          columns={[
            { key: "id", label: "#", render: (r) => r.id },
            { key: "customer_name", label: "Customer" },
            {
              key: "total_amount",
              label: "Total",
              render: (r) => formatINR(r.total_amount),
            },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <Link
                    to={`/orders/${r.id}`}
                    className="flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
                  >
                    <Eye size={14} />
                    View
                  </Link>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Cancel order?")) return;

                      try {
                        await deleteOrder(r.id);
                        showToast("Cancelled");
                        load();
                      } catch (e) {
                        showToast(e.message, "error");
                      }
                    }}
                    className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                  >
                    <Ban size={14} />
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
        <Modal title="New Order" onClose={() => setModal(false)}>
          <div className="max-h-[80vh] overflow-y-auto">
            <form onSubmit={save}>
              <Select
                label="Customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="" disabled hidden>
                  Select Customer
                </option>

                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </Select>

              {/* Order Items */}
              <div className="space-y-3">
                {lines.map((line, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg ">
                    {/* Product */}
                    <select
                      className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-2 text-sm"
                      value={line.product_id}
                      onChange={(e) => {
                        const copy = [...lines];
                        copy[i].product_id = e.target.value;
                        setLines(copy);
                      }}
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} | {formatINR(p.price)}
                        </option>
                      ))}
                    </select>
                    {/* Qty */}
                    <input
                      type="number"
                      min="1"
                      className="w-16 rounded-md border border-slate-300 px-2 py-2 text-sm"
                      value={line.quantity}
                      onChange={(e) => {
                        const copy = [...lines];
                        copy[i].quantity = e.target.value;
                        setLines(copy);
                      }}
                    />
                    {/* Delete */}
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setLines(lines.filter((_, j) => j !== i))
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Item */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() =>
                    setLines([
                      ...lines,
                      {
                        product_id: "",
                        quantity: 1,
                      },
                    ])
                  }
                  className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              {/* Total */}
              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-lg font-semibold text-slate-800">
                  Total: {formatINR(total)}
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setModal(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? "Saving..." : "Place Order"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
