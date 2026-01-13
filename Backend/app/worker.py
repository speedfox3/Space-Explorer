from celery import Celery
import os

REDIS_URL = os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/0')

celery_app = Celery('worker', broker=REDIS_URL, backend=REDIS_URL)

# Optional: configure Celery (keep minimal)
celery_app.conf.update(
    result_expires=3600,
)

# autodiscover tasks in app.tasks
celery_app.autodiscover_tasks(['app.tasks'])
 
# schedule periodic tasks (match_market every 30 seconds)
celery_app.conf.beat_schedule = {
    'match-market-every-30s': {
        'task': 'app.tasks.match_market',
        'schedule': 30.0,
    }
}
