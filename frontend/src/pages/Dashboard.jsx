import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package2,
  UsersRound,
  ShoppingCart,
  ArrowRight,
  LineChart,
} from "lucide-react";
import { getDashboard } from "../api/fetchApi";
import Card from "../components/Card";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";
import { formatINR } from "../utils/format";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
export default function Dashboard() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [showToast]);
  if (loading) return <Loading />;
  if (!data) return null;
  const columns = [
    { key: "name", label: "Product" },
    { key: "sku", label: "SKU" },
    {
      key: "quantity_in_stock",
      label: "Stock",
      render: (row) => <StatusBadge stock={row.quantity_in_stock} />,
    },
    { key: "price", label: "Price", render: (row) => formatINR(row.price) },
  ];
  const stats = [
    {
      label: "Total Products",
      value: data.total_products ?? 0,
      icon: Package2,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Customers",
      value: data.total_customers ?? 0,
      icon: UsersRound,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Total Orders",
      value: data.total_orders ?? 0,
      icon: ShoppingCart,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];
  const chartData = [
    { name: "Products", value: data.total_products ?? 0 },
    { name: "Customers", value: data.total_customers ?? 0 },
    { name: "Orders", value: data.total_orders ?? 0 },
  ];
  const chartColors = ["#3B82F6", "#10B981", "#F97316"];
  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of products, customers and orders"
      />
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500"> {item.label} </p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    {item.value}
                  </h3>
                </div>
                <div className={`rounded-lg p-3 ${item.iconBg}`}>
                  <Icon size={22} className={item.iconColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Chart + Low Stock */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Overview Statistics">
          <div
            style={{
              width: "100%",
              height: "224px",
              minWidth: "300px",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={chartColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card
          title={`Low Stock Products (${data.low_stock_products?.length || 0})`}
        >
          <div className="max-h-56 overflow-y-auto">
            <Table
              columns={columns}
              rows={data.low_stock_products || []}
              emptyText="No low stock products found"
            />
          </div>
        </Card>
      </div>
      {/* Footer */}
      <div className="flex justify-end">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
        >
          View all products <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
