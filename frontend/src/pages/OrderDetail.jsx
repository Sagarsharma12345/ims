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
  }, [id, showToast]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await deleteOrder(id);
      showToast("Order cancelled successfully");
      navigate("/orders");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
        Order not found
      </div>
    );
  }

  const columns = [
    {
      key: "product_name",
      label: "Product",
    },
    {
      key: "quantity",
      label: "Qty",
    },
    {
      key: "unit_price",
      label: "Unit Price",
      render: (row) => formatINR(row.unit_price),
    },
    {
      key: "line_total",
      label: "Amount",
      render: (row) => formatINR(row.line_total),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        <Button
          variant="danger"
          onClick={handleCancelOrder}
          className="inline-flex items-center gap-2"
        >
          <Ban size={16} />
          Cancel Order
        </Button>
      </div>

      {/* Header */}
      <PageHeader
        title={`Order #${order.id}`}
        subtitle="View complete order information"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Customer Details">
          <div className="space-y-3 text-sm p-4">
            <div>
              <p className="text-slate-500">Name</p>
              <p className="font-medium text-slate-900">
                {order.customer_name}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Email Address</p>
              <p className="font-medium text-slate-900 break-all">
                {order.customer_email}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Order Summary">
          <div className="space-y-3 p-4">
            <div>
              <p className="text-sm text-slate-500">Total Amount</p>

              <h2 className="mt-1 text-3xl font-bold text-indigo-600">
                {formatINR(order.total_amount)}
              </h2>
            </div>

            {order.created_at && (
              <div>
                <p className="text-sm text-slate-500">Order Date</p>
                <p className="font-medium text-slate-900">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Items Table */}
      <Card title={`Order Items (${order.items?.length || 0})`}>
        <Table
          columns={columns}
          rows={order.items || []}
          emptyText="No order items found"
        />
      </Card>
    </div>
  );
}
