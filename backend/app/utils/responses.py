from flask import jsonify


def success(data=None, status=200):
    return jsonify(data), status


def error(message, status=400):
    return jsonify({"detail": message}), status
