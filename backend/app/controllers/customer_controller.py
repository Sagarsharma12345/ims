from flask import Blueprint, request

from app.services.customer_service import CustomerService
from app.utils.responses import error, success

customer_bp = Blueprint("customers", __name__, url_prefix="/customers")


@customer_bp.route("", methods=["POST"])
def create_customer():
    result, errors, status = CustomerService.create(request.get_json(silent=True))
    if errors:
        return error("; ".join(errors), status)
    return success(result.to_dict(), status)


@customer_bp.route("", methods=["GET"])
def list_customers():
    customers = CustomerService.list_all()
    return success([c.to_dict() for c in customers])


@customer_bp.route("/<int:customer_id>", methods=["GET"])
def get_customer(customer_id):
    customer = CustomerService.get_by_id(customer_id)
    if not customer:
        return error("Customer not found", 404)
    return success(customer.to_dict())


@customer_bp.route("/<int:customer_id>", methods=["DELETE"])
def delete_customer(customer_id):
    ok, errors, status = CustomerService.delete(customer_id)
    if errors:
        return error("; ".join(errors), status)
    return "", status
