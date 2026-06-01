from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Customer, Order
from app.utils.validators import require_fields


class CustomerService:
  @staticmethod
  def list_all():
    return Customer.query.order_by(Customer.id).all()

  @staticmethod
  def get_by_id(customer_id):
    return Customer.query.get(customer_id)

  @staticmethod
  def create(data):
    errors = require_fields(data, ["full_name", "email", "phone"])
    if errors:
      return None, errors, 400

    customer = Customer(
      full_name=str(data["full_name"]).strip(),
      email=str(data["email"]).strip().lower(),
      phone=str(data["phone"]).strip(),
    )
    db.session.add(customer)
    try:
      db.session.commit()
      return customer, None, 201
    except IntegrityError:
      db.session.rollback()
      return None, [f"Customer with email '{data['email']}' already exists"], 409

  @staticmethod
  def delete(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
      return False, ["Customer not found"], 404
    if Order.query.filter_by(customer_id=customer_id).first():
      return False, ["Cannot delete customer with existing orders"], 400
    db.session.delete(customer)
    db.session.commit()
    return True, None, 204
