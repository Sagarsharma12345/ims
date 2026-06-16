import { LayoutDashboard, Package, Users, ShoppingCart } from "lucide-react";

export const menuItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/products",
    label: "Products",
    icon: Package,
  },
  {
    to: "/customers",
    label: "Customers",
    icon: Users,
  },
  {
    to: "/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
];
