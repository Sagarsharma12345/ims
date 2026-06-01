from flask import Blueprint, request

from app.services.product_service import ProductService
from app.utils.responses import error, success

product_bp = Blueprint("products", __name__, url_prefix="/products")


@product_bp.route("", methods=["POST"])
def create_product():
    result, errors, status = ProductService.create(request.get_json(silent=True))
    if errors:
        return error("; ".join(errors), status)
    return success(result.to_dict(), status)


@product_bp.route("", methods=["GET"])
def list_products():
    products = ProductService.list_all()
    return success([p.to_dict() for p in products])


@product_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = ProductService.get_by_id(product_id)
    if not product:
        return error("Product not found", 404)
    return success(product.to_dict())


@product_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    result, errors, status = ProductService.update(product_id, request.get_json(silent=True))
    if errors:
        return error("; ".join(errors), status)
    return success(result.to_dict(), status)


@product_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    ok, errors, status = ProductService.delete(product_id)
    if errors:
        return error("; ".join(errors), status)
    return "", status
