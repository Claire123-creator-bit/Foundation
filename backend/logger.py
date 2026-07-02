import logging
import logging.handlers
import os
from datetime import datetime

LOGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)

APP_LOG_FILE   = os.path.join(LOGS_DIR, 'app.log')
ERROR_LOG_FILE = os.path.join(LOGS_DIR, 'errors.log')
AUTH_LOG_FILE  = os.path.join(LOGS_DIR, 'auth.log')

FMT = '[%(asctime)s] %(levelname)-8s [%(name)s] %(message)s'
DATE = '%Y-%m-%d %H:%M:%S'


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


def _rotating(path, level, fmt=FMT):
    h = logging.handlers.RotatingFileHandler(path, maxBytes=10_485_760, backupCount=10)
    h.setLevel(level)
    h.setFormatter(logging.Formatter(fmt, DATE))
    return h


def setup_logging():
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    for h in root_logger.handlers[:]:
        root_logger.removeHandler(h)

    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    console.setFormatter(logging.Formatter(FMT, DATE))
    root_logger.addHandler(console)
    root_logger.addHandler(_rotating(APP_LOG_FILE, logging.DEBUG))
    root_logger.addHandler(_rotating(ERROR_LOG_FILE, logging.ERROR))

    app_logger = logging.getLogger('foundation')
    app_logger.setLevel(logging.DEBUG)
    app_logger.addHandler(_rotating(APP_LOG_FILE, logging.DEBUG))

    auth_logger = logging.getLogger('foundation.auth')
    auth_logger.setLevel(logging.DEBUG)
    auth_logger.propagate = False
    auth_logger.addHandler(_rotating(AUTH_LOG_FILE, logging.INFO))

    return app_logger, auth_logger


app_logger, auth_logger = setup_logging()
