from decimal import Decimal

from app.extensions import db
from app.models import Customer, Order, OrderItem, Product
from app.utils.validators import missing

def get_all():
    return Order.query.order_by(Order.id.desc()).all()


def get_one(order_id):
    return Order.query.get(order_id)


def create(data):
    err = missing(data, ["customer_id", "items"])
    if err:
        return None, err, 400

    items = data.get("items") or []
    if not items:
        return None, "Add at least one product", 400

    customer = Customer.query.get(data["customer_id"])
    if not customer:
        return None, "Customer not found", 404

    products = {}
    for item in items:
        pid = item.get("product_id")
        qty = item.get("quantity")
        if not pid or not qty:
            return None, "Each item needs product and quantity", 400
        try:
            qty = int(qty)
        except (TypeError, ValueError):
            return None, "Invalid quantity", 400
        if qty <= 0:
            return None, "Quantity must be greater than 0", 400

        pid = int(pid)
        if pid in products:
            return None, "Same product twice not allowed", 400

        product = Product.query.get(pid)
        if not product:
            return None, f"Product {pid} not found", 404
        if product.quantity_in_stock < qty:
            return None, f"Not enough stock for {product.name}", 400
        products[pid] = (product, qty)

    order = Order(customer_id=customer.id, total_amount=Decimal("0"))
    db.session.add(order)
    db.session.flush()

    total = Decimal("0")
    for pid, (product, qty) in products.items():
        line = Decimal(str(product.price)) * qty
        total += line
        db.session.add(
            OrderItem(
                order_id=order.id,
                product_id=pid,
                quantity=qty,
                unit_price=product.price,
            )
        )
        product.quantity_in_stock -= qty

    order.total_amount = total
    db.session.commit()
    return Order.query.get(order.id), None, 201


def delete(order_id):
    order = Order.query.get(order_id)
    if not order:
        return "Order not found", 404
    for item in order.items:
        product = Product.query.get(item.product_id)
        if product:
            product.quantity_in_stock += item.quantity
    db.session.delete(order)
    db.session.commit()
    return None, 200
