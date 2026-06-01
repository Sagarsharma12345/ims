from decimal import Decimal

from app.extensions import db
from app.models import Customer, Order, OrderItem, Product
from app.utils.validators import require_fields


class OrderService:
  @staticmethod
  def list_all():
    return Order.query.order_by(Order.id.desc()).all()

  @staticmethod
  def get_by_id(order_id):
    return Order.query.get(order_id)

  @staticmethod
  def create(data):
    errors = require_fields(data, ["customer_id", "items"])
    if errors:
      return None, errors, 400

    items = data.get("items") or []
    if not isinstance(items, list) or len(items) == 0:
      return None, ["Order must contain at least one product"], 400

    product_ids = [i.get("product_id") for i in items]
    if len(product_ids) != len(set(product_ids)):
      return None, ["Duplicate products in the same order are not allowed"], 400

    customer = Customer.query.get(data["customer_id"])
    if not customer:
      return None, ["Customer not found"], 404

    products_by_id = {}
    for item in items:
      if not item.get("product_id") or not item.get("quantity"):
        return None, ["Each item needs product_id and quantity"], 400
      try:
        qty = int(item["quantity"])
        if qty <= 0:
          return None, ["Quantity must be greater than 0"], 400
      except (TypeError, ValueError):
        return None, ["Quantity must be a valid integer"], 400

      pid = int(item["product_id"])
      if pid not in products_by_id:
        product = Product.query.get(pid)
        if not product:
          return None, [f"Product with id {pid} not found"], 404
        products_by_id[pid] = product

    for item in items:
      product = products_by_id[int(item["product_id"])]
      qty = int(item["quantity"])
      if product.quantity_in_stock < qty:
        return None, [
          f"Insufficient stock for '{product.name}' (SKU: {product.sku}). "
          f"Available: {product.quantity_in_stock}, requested: {qty}"
        ], 400

    order = Order(customer_id=customer.id, total_amount=Decimal("0"))
    db.session.add(order)
    db.session.flush()

    total = Decimal("0")
    for item in items:
      product = products_by_id[int(item["product_id"])]
      qty = int(item["quantity"])
      line_total = Decimal(str(product.price)) * qty
      total += line_total
      db.session.add(
        OrderItem(
          order_id=order.id,
          product_id=product.id,
          quantity=qty,
          unit_price=product.price,
        )
      )
      product.quantity_in_stock -= qty

    order.total_amount = total
    db.session.commit()
    return Order.query.get(order.id), None, 201

  @staticmethod
  def delete(order_id):
    order = Order.query.get(order_id)
    if not order:
      return False, ["Order not found"], 404
    for item in order.items:
      product = Product.query.get(item.product_id)
      if product:
        product.quantity_in_stock += item.quantity
    db.session.delete(order)
    db.session.commit()
    return True, None, 204
