from app.models import Customer, Order, Product

LOW_STOCK = 10


class DashboardService:
  @staticmethod
  def summary():
    low_stock = (
      Product.query.filter(Product.quantity_in_stock <= LOW_STOCK)
      .order_by(Product.quantity_in_stock.asc())
      .all()
    )
    return {
      "total_products": Product.query.count(),
      "total_customers": Customer.query.count(),
      "total_orders": Order.query.count(),
      "low_stock_products": [p.to_dict() for p in low_stock],
    }
