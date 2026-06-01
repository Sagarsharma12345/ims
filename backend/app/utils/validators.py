def require_fields(data, fields):
    errors = []
    if not data or not isinstance(data, dict):
        return ["Request body must be JSON object"]
    for field in fields:
        if field not in data or data[field] in (None, ""):
            errors.append(f"{field} is required")
    return errors


def positive_number(value, field_name):
    try:
        num = float(value)
        if num <= 0:
            return f"{field_name} must be greater than 0"
    except (TypeError, ValueError):
        return f"{field_name} must be a valid number"
    return None


def non_negative_int(value, field_name):
    try:
        num = int(value)
        if num < 0:
            return f"{field_name} cannot be negative"
    except (TypeError, ValueError):
        return f"{field_name} must be a valid integer"
    return None
