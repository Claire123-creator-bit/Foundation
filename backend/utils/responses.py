from flask import jsonify


def json_api_error(message: str, status_code: int):
    """Standard error response format."""
    return jsonify({"success": False, "message": message}), status_code


def json_api_success(data=None, message="", status_code=200):
    """Standard success response format."""
    response = {"success": True}
    if message:
        response["message"] = message
    if data is not None:
        response.update(data)
    return jsonify(response), status_code
