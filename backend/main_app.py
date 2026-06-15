from flask import Flask, jsonify, request
import jwt
import os

app = Flask(__name__)

# Render/production should set SECRET_KEY; keep local fallback.
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret")

@app.route('/me', methods=['GET'])
def get_me():
    try:
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"error": "Missing token"}), 401

        # remove Bearer prefix if exists
        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

        return jsonify({
            "success": True,
            "user": decoded
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/media', methods=['GET'])
def get_media():
    # Minimal safe default: return JSON list.
    # This fixes JSON-vs-HTML parsing on the frontend when no media is present.
    return jsonify([]), 200

