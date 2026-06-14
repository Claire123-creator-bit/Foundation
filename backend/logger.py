import logging
import logging.handlers
import os
from datetime import datetime

# Create logs directory
LOGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)

# Log file paths
APP_LOG_FILE = os.path.join(LOGS_DIR, 'app.log')
ERROR_LOG_FILE = os.path.join(LOGS_DIR, 'errors.log')
AUTH_LOG_FILE = os.path.join(LOGS_DIR, 'auth.log')


class JSONFormatter(logging.Formatter):

    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return str(log_data)


def setup_logging():

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)

    app_logger = logging.getLogger('foundation')
    app_logger.setLevel(logging.DEBUG)

    auth_logger = logging.getLogger('foundation.auth')
    auth_logger.setLevel(logging.DEBUG)
    # Prevent Flask/Gunicorn/root logging hierarchy from swallowing auth logs.
    auth_logger.propagate = False


    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)-8s [%(name)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)

    app_handler = logging.handlers.RotatingFileHandler(
        APP_LOG_FILE,
        maxBytes=10_485_760,  # 10MB
        backupCount=10
    )
    app_handler.setLevel(logging.DEBUG)
    app_formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)-8s [%(name)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    app_handler.setFormatter(app_formatter)
    app_logger.addHandler(app_handler)

    error_handler = logging.handlers.RotatingFileHandler(
        ERROR_LOG_FILE,
        maxBytes=10_485_760,  # 10MB
        backupCount=10
    )
    error_handler.setLevel(logging.ERROR)
    error_formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)-8s [%(name)s] %(message)s\n%(exc_info)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    error_handler.setFormatter(error_formatter)
    root_logger.addHandler(error_handler)

    auth_handler = logging.handlers.RotatingFileHandler(
        AUTH_LOG_FILE,
        maxBytes=10_485_760,  # 10MB
        backupCount=10
    )
    auth_handler.setLevel(logging.INFO)
    auth_formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)-8s %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    auth_handler.setFormatter(auth_formatter)
    auth_logger.addHandler(auth_handler)
    
    return app_logger, auth_logger


# Initialize loggers
app_logger, auth_logger = setup_logging()
