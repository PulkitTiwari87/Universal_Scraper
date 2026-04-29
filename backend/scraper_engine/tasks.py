import asyncio
from celery import Celery
from .crawler import UniversalCrawler

# Initialize Celery app
celery_app = Celery(
    'scraper_tasks',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

@celery_app.task(name="scraper_engine.tasks.run_crawl")
def run_crawl(job_id: str, start_url: str, config: dict):
    # Celery tasks are synchronous, but our crawler is asynchronous
    # We need to run the async crawler in an event loop
    crawler = UniversalCrawler(config, job_id)
    
    # Create a new event loop for this thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        results = loop.run_until_complete(crawler.crawl(start_url))
        return len(results)
    finally:
        loop.close()
