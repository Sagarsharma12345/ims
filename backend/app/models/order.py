from app.extensions import db


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)
    total_amount = db.Column(db.Numeric(12, 2), nullable=False)

    customer = db.relationship("Customer", backref="orders")
    items = db.relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    def to_dict(self, with_items=False):
        data = {
            "id": self.id,
            "customer_id": self.customer_id,
            "customer_name": self.customer.full_name if self.customer else "",
            "customer_email": self.customer.email if self.customer else "",
            "total_amount": float(self.total_amount),
            "items": [],
        }
        if with_items:
            data["items"] = [item.to_dict() for item in self.items]
        return data


class OrderItem(db.Model):
    __tablename__ = "order_items"
    __table_args__ = (db.UniqueConstraint("order_id", "product_id", name="uq_order_product"),)

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(12, 2), nullable=False)

    order = db.relationship("Order", back_populates="items")
    product = db.relationship("Product")

    def to_dict(self):
        line_total = float(self.unit_price) * self.quantity
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else "",
            "product_sku": self.product.sku if self.product else "",
            "quantity": self.quantity,
            "unit_price": float(self.unit_price),
            "line_total": line_total,
        }
