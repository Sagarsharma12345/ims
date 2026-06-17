from flask import Blueprint, request

from app.services import customer_service as svc
from app.utils.responses import fail, ok

customer_bp = Blueprint("customers", __name__, url_prefix="/customers")


@customer_bp.route("", methods=["GET"])
def list_customers():
    return ok([c.to_dict() for c in svc.get_all()])


@customer_bp.route("", methods=["POST"])
def create_customer():
    data = request.get_json(silent=True) or {}
    item, err, code = svc.create(data)
    if err:
        return fail(err, code)
    return ok(item.to_dict(), code)


@customer_bp.route("/<int:customer_id>", methods=["GET"])
def get_customer(customer_id):
    customer = svc.get_one(customer_id)
    if not customer:
        return fail("Customer not found", 404)
    return ok(customer.to_dict())


@customer_bp.route("/<int:customer_id>", methods=["DELETE"])
def delete_customer(customer_id):
    err, code = svc.delete(customer_id)
    if err:
        return fail(err, code)
    return ok(None, code)
