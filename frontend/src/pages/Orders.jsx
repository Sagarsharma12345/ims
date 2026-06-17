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
import Pagination from "../components/Pagination";
import SearchBox from "../components/SearchBox";
import Select from "../components/Select";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";
import { formatINR } from "../utils/format";
import { filterSortPage } from "../utils/tableHelpers";
import { Ban, Eye, Plus, Trash2 } from "lucide-react";

export default function Orders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ product_id: "", quantity: 1 }]);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
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

  const table = filterSortPage(orders, {
    search,
    keys: ["id", "customer_name", "customer_email"],
    sortKey,
    sortOrder,
    page,
  });

  const total = lines.reduce((sum, line) => {
    const p = products.find((x) => String(x.id) === String(line.product_id));
    return p ? sum + Number(p.price) * Number(line.quantity || 0) : sum;
  }, 0);

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
    if (!customerId) return showToast("Select customer", "error");

    const items = lines
      .filter((l) => l.product_id)
      .map((l) => ({
        product_id: Number(l.product_id),
        quantity: Number(l.quantity),
      }));

    if (!items.length) return showToast("Add at least one product", "error");

    setSaving(true);
    try {
      await createOrder({ customer_id: Number(customerId), items });
      setModal(false);
      showToast("Order placed");
      load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "id", label: "Order ID" },
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
        <div className="flex gap-2">
          <Link
            to={`/orders/${r.id}`}
            className="rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs text-indigo-600"
          >
            <Eye size={14} className="inline" /> View
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
            className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600"
          >
            <Ban size={14} className="inline" /> Cancel
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Orders"
        action={
          <Button onClick={() => setModal(true)}>
            <Plus size={16} className="inline" /> New Order
          </Button>
        }
      />

      <Card>
        <div className="border-b border-slate-100 p-3 sm:p-4">
          <SearchBox
            value={search}
            onChange={onSearch}
            placeholder="Search order or customer"
          />
        </div>

        <Table
          columns={columns}
          rows={table.rows}
          emptyText="No orders"
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
        <Modal title="New Order" onClose={() => setModal(false)}>
          <form onSubmit={save}>
            <Select
              label="Customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </Select>

            {lines.map((line, i) => (
              <div key={i} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <select
                  className="flex-1 rounded border border-slate-300 px-2 py-2 text-sm"
                  value={line.product_id}
                  onChange={(e) => {
                    const copy = [...lines];
                    copy[i].product_id = e.target.value;
                    setLines(copy);
                  }}
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatINR(p.price)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="w-20 rounded border border-slate-300 px-2 py-2 text-sm"
                  value={line.quantity}
                  onChange={(e) => {
                    const copy = [...lines];
                    copy[i].quantity = e.target.value;
                    setLines(copy);
                  }}
                />
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLines(lines.filter((_, j) => j !== i))}
                    className="rounded border border-red-200 bg-red-50 px-3 text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setLines([...lines, { product_id: "", quantity: 1 }])
              }
              className="mt-3 rounded border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-600"
            >
              + Add item
            </button>

            <p className="mt-4 text-lg font-semibold">
              Total: {formatINR(total)}
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Place Order"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
