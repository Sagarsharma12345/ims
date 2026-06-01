from flask import Flask
from flask_cors import CORS
from sqlalchemy import text

from app.config import Config
from app.controllers.customer_controller import customer_bp
from app.controllers.dashboard_controller import dashboard_bp
from app.controllers.order_controller import order_bp
from app.controllers.product_controller import product_bp
from app.extensions import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=Config.cors_origin_list())
    db.init_app(app)

    app.register_blueprint(product_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(dashboard_bp)

    @app.route("/api")
    def api_status():
        try:
            db.session.execute(text("SELECT 1"))
            return {"status": "ok"}
        except Exception:
            return {"status": "error"}, 503

    with app.app_context():
        db.create_all()

    return app
