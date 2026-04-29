import asyncio
from urllib.parse import urljoin
from bs4 import BeautifulSoup

class Extractor:
    def __init__(self, rules):
        self.rules = rules

    def parse(self, html_content):
        soup = BeautifulSoup(html_content, 'html.parser')
        data = {}
        for key, selector in self.rules.items():
            element = soup.select_one(selector)
            data[key] = element.text.strip() if element else None
        return data

    def extract_links(self, html_content, base_url):
        soup = BeautifulSoup(html_content, 'html.parser')
        links = set()
        for a_tag in soup.find_all('a', href=True):
            full_url = urljoin(base_url, a_tag['href'])
            if full_url.startswith('http'):
                links.add(full_url)
        return list(links)
