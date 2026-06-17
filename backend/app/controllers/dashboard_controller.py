from flask import Blueprint

from app.services.dashboard_service import get_summary
from app.utils.responses import ok

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@dashboard_bp.route("/summary", methods=["GET"])
def dashboard_summary():
    return ok(get_summary())
