from flask import jsonify


def json_api_error(message: str, status_code: int):
    return jsonify({"success": False, "message": message}), status_code


def json_api_success(data=None, message="", status_code=200):
    response = {"success": True}
    if message:
        response["message"] = message
    if data is not None:
        response.update(data)
    return jsonify(response), status_code
