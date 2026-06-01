from flask import Blueprint

from app.services.dashboard_service import DashboardService
from app.utils.responses import success

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@dashboard_bp.route("/summary", methods=["GET"])
def dashboard_summary():
    return success(DashboardService.summary())
