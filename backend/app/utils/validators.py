def require_fields(data, fields):
    if not isinstance(data, dict):
        return ["Request body must be JSON object"]

    errors = []

    for field in fields:
        if field not in data or data[field] in (None, ""):
            errors.append(f"{field} is required")

    return errors


def positive_number(value, field_name):
    try:
        number = float(value)

        if number <= 0:
            return f"{field_name} must be greater than 0"

    except (TypeError, ValueError):
        return f"{field_name} must be a valid number"

    return None


def non_negative_int(value, field_name):
    try:
        number = int(value)

        if number < 0:
            return f"{field_name} cannot be negative"

    except (TypeError, ValueError):
        return f"{field_name} must be a valid integer"

    return None