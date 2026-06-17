from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Customer, Order
from app.utils.validators import missing

def get_all():
    return Customer.query.order_by(Customer.id).all()


def get_one(customer_id):
    return Customer.query.get(customer_id)


def create(data):
    err = missing(data, ["full_name", "email", "phone"])
    if err:
        return None, err, 400

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
        return None, "Email already exists", 409


def delete(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return "Customer not found", 404
    if Order.query.filter_by(customer_id=customer_id).first():
        return "Customer has orders", 400
    db.session.delete(customer)
    db.session.commit()
    return None, 200
