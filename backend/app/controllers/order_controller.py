from flask import Blueprint, request

from app.services.order_service import OrderService
from app.utils.responses import error, success

order_bp = Blueprint("orders", __name__, url_prefix="/orders")


@order_bp.route("", methods=["POST"])
def create_order():
    result, errors, status = OrderService.create(request.get_json(silent=True))
    if errors:
        return error("; ".join(errors), status)
    return success(result.to_dict(with_items=True), status)


@order_bp.route("", methods=["GET"])
def list_orders():
    orders = OrderService.list_all()
    return success([o.to_dict(with_items=True) for o in orders])


@order_bp.route("/<int:order_id>", methods=["GET"])
def get_order(order_id):
    order = OrderService.get_by_id(order_id)
    if not order:
        return error("Order not found", 404)
    return success(order.to_dict(with_items=True))


@order_bp.route("/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    ok, errors, status = OrderService.delete(order_id)
    if errors:
        return error("; ".join(errors), status)
    return "", status
