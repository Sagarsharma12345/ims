from flask import Blueprint, request

from app.services import order_service as svc
from app.utils.responses import fail, ok

order_bp = Blueprint("orders", __name__, url_prefix="/orders")


@order_bp.route("", methods=["GET"])
def list_orders():
    return ok([o.to_dict(with_items=True) for o in svc.get_all()])


@order_bp.route("", methods=["POST"])
def create_order():
    data = request.get_json(silent=True) or {}
    item, err, code = svc.create(data)
    if err:
        return fail(err, code)
    return ok(item.to_dict(with_items=True), code)


@order_bp.route("/<int:order_id>", methods=["GET"])
def get_order(order_id):
    order = svc.get_one(order_id)
    if not order:
        return fail("Order not found", 404)
    return ok(order.to_dict(with_items=True))


@order_bp.route("/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    err, code = svc.delete(order_id)
    if err:
        return fail(err, code)
    return ok(None, code)
