import asyncio
from typing import Dict, Any
from .browser_manager import BrowserManager
from .extractor import Extractor
from .database import update_job_status, save_extraction, add_log

class UniversalCrawler:
    def __init__(self, config: Dict[str, Any], job_id: str):
        self.max_depth = config.get('max_depth', 2)
        self.delay = config.get('politeness_delay', 1.0)
        self.extractor = Extractor(config.get('css_selectors', {}))
        self.visited_urls = set()
        self.job_id = job_id

    async def crawl(self, start_url: str):
        add_log(self.job_id, "success", f"Starting crawl job for {start_url}")
        update_job_status(self.job_id, "running")
        
        browser_manager = BrowserManager()
        context = await browser_manager.init_browser()
        page = await context.new_page()

        queue = [(start_url, 0)]  # (url, depth)
        results = []

        try:
            while queue:
                current_url, depth = queue.pop(0)

                if depth > self.max_depth or current_url in self.visited_urls:
                    continue

                self.visited_urls.add(current_url)
                
                # Politeness delay except for first request
                if len(self.visited_urls) > 1:
                    add_log(self.job_id, "warning", f"Applying {self.delay}s politeness delay.")
                    await asyncio.sleep(self.delay)

                try:
                    add_log(self.job_id, "extracting", f"Crawling: {current_url} (Depth: {depth})")
                    await page.goto(current_url, wait_until="networkidle")
                    content = await page.content()
                    
                    # Extract data based on selectors
                    data = self.extractor.parse(content)
                    data['source_url'] = current_url
                    results.append(data)
                    
                    # Save to DB
                    save_extraction(self.job_id, current_url, data)
                    add_log(self.job_id, "success", f"Extracted data from {current_url}")
                    
                    # Add new links to queue if we haven't reached max depth
                    if depth < self.max_depth:
                        new_links = self.extractor.extract_links(content, current_url)
                        queued_count = 0
                        for link in new_links:
                            if link not in self.visited_urls:
                                queue.append((link, depth + 1))
                                queued_count += 1
                        if queued_count > 0:
                            add_log(self.job_id, "queued", f"Found {queued_count} new links. Queued.")
                                
                except Exception as e:
                    add_log(self.job_id, "warning", f"Error crawling {current_url}: {str(e)}")

            update_job_status(self.job_id, "completed")
            add_log(self.job_id, "success", "Crawl job completed successfully.")
        except Exception as e:
            update_job_status(self.job_id, "failed")
            add_log(self.job_id, "warning", f"Job failed: {str(e)}")
        finally:
            await browser_manager.close()
            
        return results
