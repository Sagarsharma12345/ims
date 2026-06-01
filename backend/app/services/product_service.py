from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Product
from app.utils.validators import non_negative_int, positive_number, require_fields


class ProductService:
    @staticmethod
    def list_all():
        return Product.query.order_by(Product.id).all()

    @staticmethod
    def get_by_id(product_id):
        return Product.query.get(product_id)

    @staticmethod
    def create(data):
        errors = require_fields(data, ["name", "sku", "price", "quantity_in_stock"])
        if errors:
            return None, errors, 400
        err = positive_number(data["price"], "price")
        if err:
            return None, [err], 400
        err = non_negative_int(data["quantity_in_stock"], "quantity_in_stock")
        if err:
            return None, [err], 400

        product = Product(
            name=str(data["name"]).strip(),
            sku=str(data["sku"]).strip(),
            price=data["price"],
            quantity_in_stock=int(data["quantity_in_stock"]),
        )
        db.session.add(product)
        try:
            db.session.commit()
            return product, None, 201
        except IntegrityError:
            db.session.rollback()
            return None, [f"SKU '{data['sku']}' already exists"], 409

    @staticmethod
    def update(product_id, data):
        product = Product.query.get(product_id)
        if not product:
            return None, ["Product not found"], 404
        if not data:
            return None, ["Nothing to update"], 400

        if "name" in data and data["name"] is not None:
            product.name = str(data["name"]).strip()
        if "sku" in data and data["sku"] is not None:
            product.sku = str(data["sku"]).strip()
        if "price" in data and data["price"] is not None:
            err = positive_number(data["price"], "price")
            if err:
                return None, [err], 400
            product.price = data["price"]
        if "quantity_in_stock" in data and data["quantity_in_stock"] is not None:
            err = non_negative_int(data["quantity_in_stock"], "quantity_in_stock")
            if err:
                return None, [err], 400
            product.quantity_in_stock = int(data["quantity_in_stock"])

        try:
            db.session.commit()
            return product, None, 200
        except IntegrityError:
            db.session.rollback()
            return None, ["SKU already in use"], 409

    @staticmethod
    def delete(product_id):
        product = Product.query.get(product_id)
        if not product:
            return False, ["Product not found"], 404
        db.session.delete(product)
        db.session.commit()
        return True, None, 204
