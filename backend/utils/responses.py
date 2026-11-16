from flask import jsonify


def json_api_error(message: str, status_code: int):
    return jsonify({"success": False, "message": message}), status_code
