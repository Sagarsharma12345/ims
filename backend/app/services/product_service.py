from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Product
from app.utils.validators import missing

def get_all():
    return Product.query.order_by(Product.id).all()


def get_one(product_id):
    return Product.query.get(product_id)


def create(data):
    err = missing(data, ["name", "sku", "price", "quantity_in_stock"])
    if err:
        return None, err, 400

    try:
        price = float(data["price"])
        stock = int(data["quantity_in_stock"])
    except (TypeError, ValueError):
        return None, "Invalid price or stock", 400

    if price <= 0:
        return None, "Price must be greater than 0", 400
    if stock < 0:
        return None, "Stock cannot be negative", 400

    product = Product(
        name=str(data["name"]).strip(),
        sku=str(data["sku"]).strip(),
        price=price,
        quantity_in_stock=stock,
    )
    db.session.add(product)
    try:
        db.session.commit()
        return product, None, 201
    except IntegrityError:
        db.session.rollback()
        return None, "SKU already exists", 409


def update(product_id, data):
    product = Product.query.get(product_id)
    if not product:
        return None, "Product not found", 404
    if not data:
        return None, "Nothing to update", 400

    if data.get("name"):
        product.name = str(data["name"]).strip()
    if data.get("sku"):
        product.sku = str(data["sku"]).strip()
    if data.get("price") is not None:
        try:
            price = float(data["price"])
        except (TypeError, ValueError):
            return None, "Invalid price", 400
        if price <= 0:
            return None, "Price must be greater than 0", 400
        product.price = price
    if data.get("quantity_in_stock") is not None:
        try:
            stock = int(data["quantity_in_stock"])
        except (TypeError, ValueError):
            return None, "Invalid stock", 400
        if stock < 0:
            return None, "Stock cannot be negative", 400
        product.quantity_in_stock = stock

    try:
        db.session.commit()
        return product, None, 200
    except IntegrityError:
        db.session.rollback()
        return None, "SKU already exists", 409


def delete(product_id):
    product = Product.query.get(product_id)
    if not product:
        return "Product not found", 404
    db.session.delete(product)
    db.session.commit()
    return None, 200
