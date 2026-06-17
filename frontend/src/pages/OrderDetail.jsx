import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteOrder, getOrder } from "../api/fetchApi";
import Button from "../components/Button";
import Card from "../components/Card";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";
import { formatINR } from "../utils/format";
import { ArrowLeft, Ban } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then(setOrder)
      .catch((e) => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const cancelOrder = async () => {
    if (!confirm("Cancel this order?")) return;
    try {
      await deleteOrder(id);
      showToast("Cancelled");
      navigate("/orders");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  if (loading) return <Loading />;
  if (!order) return <p className="text-red-600">Order not found</p>;

  const columns = [
    { key: "product_name", label: "Product" },
    { key: "quantity", label: "Qty" },
    {
      key: "unit_price",
      label: "Price",
      render: (r) => formatINR(r.unit_price),
    },
    {
      key: "line_total",
      label: "Amount",
      render: (r) => formatINR(r.line_total),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/orders" className="text-sm text-indigo-600">
          <ArrowLeft size={16} className="inline" /> Back
        </Link>
        <Button variant="danger" onClick={cancelOrder}>
          <Ban size={16} className="inline" /> &nbsp;Cancel Order
        </Button>
      </div>

      <PageHeader title={`Order #${order.id}`} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Customer Details">
          <div className="space-y-2 p-4 text-sm">
            <p>
              <span className="text-slate-500">Name:</span>{" "}
              {order.customer_name}
            </p>
            <p>
              <span className="text-slate-500">Email:</span>{" "}
              {order.customer_email}
            </p>
          </div>
        </Card>

        <Card title="Summary Details">
          <div className="p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold text-indigo-600">
              {formatINR(order.total_amount)}
            </p>
          </div>
        </Card>
      </div>

      <Card title="Items">
        <Table
          columns={columns}
          rows={order.items || []}
          emptyText="No items"
          page={1}
        />
      </Card>
    </div>
  );
}
