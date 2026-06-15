"""Gunicorn entrypoint.

This module must expose a Flask application object as `app`.
"""

from main_app import app  # main_app.py is in the same directory as wsgi.py



