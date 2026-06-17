from flask import Blueprint, request

from app.services import product_service as svc
from app.utils.responses import fail, ok

product_bp = Blueprint("products", __name__, url_prefix="/products")


@product_bp.route("", methods=["GET"])
def list_products():
    return ok([p.to_dict() for p in svc.get_all()])


@product_bp.route("", methods=["POST"])
def create_product():
    data = request.get_json(silent=True) or {}
    item, err, code = svc.create(data)
    if err:
        return fail(err, code)
    return ok(item.to_dict(), code)


@product_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = svc.get_one(product_id)
    if not product:
        return fail("Product not found", 404)
    return ok(product.to_dict())


@product_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json(silent=True) or {}
    item, err, code = svc.update(product_id, data)
    if err:
        return fail(err, code)
    return ok(item.to_dict(), code)


@product_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    err, code = svc.delete(product_id)
    if err:
        return fail(err, code)
    return ok(None, code)
