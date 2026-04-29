import logging
import sys
from datetime import UTC, datetime


class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
        }
        if record.exc_info and record.exc_info[1]:
            log["exception"] = str(record.exc_info[1])
        return str(log).replace("'", '"')


def setup_logging(debug: bool = False):
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())

    level = logging.DEBUG if debug else logging.INFO

    # App logger
    logger = logging.getLogger("app")
    logger.setLevel(level)
    logger.addHandler(handler)
    logger.propagate = False

    # Silence noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    return logger
