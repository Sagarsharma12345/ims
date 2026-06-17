def missing(data, fields):
    if not isinstance(data, dict):
        return "Invalid JSON"
    for field in fields:
        if not data.get(field) and data.get(field) != 0:
            return f"{field} is required"
    return None
