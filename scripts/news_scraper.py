#!/usr/bin/env python3
"""
Advanced News Scraper for Indian Stock Market
Scrapes news from multiple sources and stores in database
"""

import requests
from bs4 import BeautifulSoup
import json
import psycopg2
from datetime import datetime, timedelta
import time
import re
import logging
from typing import List, Dict, Optional
import os
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class NewsArticle:
    headline: str
    summary: str
    source: str
    url: str
    published_at: datetime
    sentiment: str
    relevant_stocks: List[str]
    impact_score: float

class IndianStockNewsScraper:
    def __init__(self, database_url: Optional[str] = None):
        self.database_url = database_url or os.getenv('DATABASE_URL')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
        
        # Stock symbol mapping for Indian companies
        self.stock_mapping = {
            'TCS': ['TCS', 'Tata Consultancy Services', 'Tata Consultancy'],
            'RELIANCE': ['Reliance', 'RIL', 'Reliance Industries'],
            'HDFCBANK': ['HDFC Bank', 'HDFC', 'Housing Development Finance Corporation'],
            'INFY': ['Infosys', 'INFY'],
            'ICICIBANK': ['ICICI Bank', 'ICICI'],
            'SBIN': ['SBI', 'State Bank', 'State Bank of India'],
            'WIPRO': ['Wipro'],
            'MARUTI': ['Maruti', 'Maruti Suzuki'],
            'SUNPHARMA': ['Sun Pharma', 'Sun Pharmaceutical'],
            'TATAMOTORS': ['Tata Motors'],
            'BHARTIARTL': ['Bharti Airtel', 'Airtel'],
            'HCLTECH': ['HCL Technologies', 'HCL Tech', 'HCL'],
            'ASIANPAINT': ['Asian Paints'],
            'KOTAKBANK': ['Kotak Mahindra Bank', 'Kotak Bank', 'Kotak'],
            'LT': ['Larsen & Toubro', 'L&T', 'Larsen and Toubro'],
            'AXISBANK': ['Axis Bank'],
            'BAJFINANCE': ['Bajaj Finance'],
            'ULTRACEMCO': ['UltraTech Cement'],
            'NESTLEIND': ['Nestle India'],
            'POWERGRID': ['Power Grid Corporation'],
        }
        
        # Sentiment analysis keywords
        self.positive_keywords = [
            'surge', 'rally', 'gain', 'rise', 'up', 'positive', 'strong', 'growth',
            'bullish', 'optimistic', 'boost', 'soar', 'jump', 'climb', 'advance',
            'outperform', 'beat', 'exceed', 'record', 'high', 'profit', 'revenue',
            'expansion', 'acquisition', 'merger', 'dividend', 'bonus', 'split'
        ]
        
        self.negative_keywords = [
            'fall', 'drop', 'decline', 'down', 'negative', 'weak', 'loss', 'crash',
            'bearish', 'pessimistic', 'plunge', 'tumble', 'slide', 'slump', 'retreat',
            'underperform', 'miss', 'disappoint', 'low', 'deficit', 'concern', 'worry',
            'layoff', 'restructure', 'debt', 'lawsuit', 'investigation', 'penalty'
        ]

    def scrape_moneycontrol(self) -> List[NewsArticle]:
        """Scrape news from Moneycontrol"""
        articles = []
        try:
            logger.info("Scraping Moneycontrol...")
            
            # Multiple pages for better coverage
            urls = [
                'https://www.moneycontrol.com/news/business/',
                'https://www.moneycontrol.com/news/business/markets/',
                'https://www.moneycontrol.com/news/business/earnings/'
            ]
            
            for url in urls:
                try:
                    response = self.session.get(url, timeout=10)
                    response.raise_for_status()
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find news articles
                    news_items = soup.find_all('li', class_='clearfix')[:15]
                    
                    for item in news_items:
                        try:
                            headline_elem = item.find('h2') or item.find('a')
                            if not headline_elem:
                                continue
                                
                            headline = headline_elem.get_text(strip=True)
                            link = headline_elem.get('href', '') if headline_elem.name == 'a' else headline_elem.find('a', href=True)
                            
                            if isinstance(link, str):
                                url_link = link
                            else:
                                url_link = link.get('href', '') if link else ''
                            
                            if not url_link.startswith('http'):
                                url_link = f"https://www.moneycontrol.com{url_link}"
                            
                            # Get summary
                            summary_elem = item.find('p')
                            summary = summary_elem.get_text(strip=True) if summary_elem else headline
                            
                            # Get timestamp
                            time_elem = item.find('span', class_='ago')
                            published_at = self._parse_time_text(time_elem.get_text(strip=True) if time_elem else 'recent')
                            
                            # Extract relevant stocks and analyze sentiment
                            relevant_stocks = self._extract_stock_symbols(headline + ' ' + summary)
                            sentiment = self._analyze_sentiment(headline + ' ' + summary)
                            impact_score = self._calculate_impact_score(sentiment, len(relevant_stocks))
                            
                            if headline and len(headline) > 10:  # Filter out very short headlines
                                articles.append(NewsArticle(
                                    headline=headline,
                                    summary=summary,
                                    source='Moneycontrol',
                                    url=url_link,
                                    published_at=published_at,
                                    sentiment=sentiment,
                                    relevant_stocks=relevant_stocks,
                                    impact_score=impact_score
                                ))
                                
                        except Exception as e:
                            logger.warning(f"Error parsing Moneycontrol article: {e}")
                            continue
                    
                    time.sleep(2)  # Be respectful to the server
                    
                except Exception as e:
                    logger.error(f"Error scraping Moneycontrol URL {url}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error scraping Moneycontrol: {e}")
            
        logger.info(f"Scraped {len(articles)} articles from Moneycontrol")
        return articles

    def scrape_economic_times(self) -> List[NewsArticle]:
        """Scrape news from Economic Times"""
        articles = []
        try:
            logger.info("Scraping Economic Times...")
            
            urls = [
                'https://economictimes.indiatimes.com/markets',
                'https://economictimes.indiatimes.com/markets/stocks',
                'https://economictimes.indiatimes.com/markets/earnings'
            ]
            
            for url in urls:
                try:
                    response = self.session.get(url, timeout=10)
                    response.raise_for_status()
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find news articles
                    news_items = soup.find_all('div', class_='eachStory')[:10]
                    
                    for item in news_items:
                        try:
                            headline_elem = item.find('h3') or item.find('h2')
                            if not headline_elem:
                                continue
                                
                            link_elem = headline_elem.find('a')
                            if not link_elem:
                                continue
                                
                            headline = link_elem.get_text(strip=True)
                            url_link = link_elem.get('href', '')
                            
                            if not url_link.startswith('http'):
                                url_link = f"https://economictimes.indiatimes.com{url_link}"
                            
                            # Get summary
                            summary_elem = item.find('p')
                            summary = summary_elem.get_text(strip=True) if summary_elem else headline
                            
                            # Extract relevant stocks and analyze sentiment
                            relevant_stocks = self._extract_stock_symbols(headline + ' ' + summary)
                            sentiment = self._analyze_sentiment(headline + ' ' + summary)
                            impact_score = self._calculate_impact_score(sentiment, len(relevant_stocks))
                            
                            if headline and len(headline) > 10:
                                articles.append(NewsArticle(
                                    headline=headline,
                                    summary=summary,
                                    source='Economic Times',
                                    url=url_link,
                                    published_at=datetime.now(),
                                    sentiment=sentiment,
                                    relevant_stocks=relevant_stocks,
                                    impact_score=impact_score
                                ))
                                
                        except Exception as e:
                            logger.warning(f"Error parsing ET article: {e}")
                            continue
                    
                    time.sleep(2)
                    
                except Exception as e:
                    logger.error(f"Error scraping ET URL {url}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error scraping Economic Times: {e}")
            
        logger.info(f"Scraped {len(articles)} articles from Economic Times")
        return articles

    def scrape_business_standard(self) -> List[NewsArticle]:
        """Scrape news from Business Standard"""
        articles = []
        try:
            logger.info("Scraping Business Standard...")
            
            urls = [
                'https://www.business-standard.com/markets',
                'https://www.business-standard.com/companies'
            ]
            
            for url in urls:
                try:
                    response = self.session.get(url, timeout=10)
                    response.raise_for_status()
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find news articles
                    news_items = soup.find_all('div', class_='listingstyle')[:10]
                    
                    for item in news_items:
                        try:
                            headline_elem = item.find('h2') or item.find('h3')
                            if not headline_elem:
                                continue
                                
                            link_elem = headline_elem.find('a')
                            if not link_elem:
                                continue
                                
                            headline = link_elem.get_text(strip=True)
                            url_link = link_elem.get('href', '')
                            
                            if not url_link.startswith('http'):
                                url_link = f"https://www.business-standard.com{url_link}"
                            
                            # Get summary
                            summary_elem = item.find('p')
                            summary = summary_elem.get_text(strip=True) if summary_elem else headline
                            
                            # Extract relevant stocks and analyze sentiment
                            relevant_stocks = self._extract_stock_symbols(headline + ' ' + summary)
                            sentiment = self._analyze_sentiment(headline + ' ' + summary)
                            impact_score = self._calculate_impact_score(sentiment, len(relevant_stocks))
                            
                            if headline and len(headline) > 10:
                                articles.append(NewsArticle(
                                    headline=headline,
                                    summary=summary,
                                    source='Business Standard',
                                    url=url_link,
                                    published_at=datetime.now(),
                                    sentiment=sentiment,
                                    relevant_stocks=relevant_stocks,
                                    impact_score=impact_score
                                ))
                                
                        except Exception as e:
                            logger.warning(f"Error parsing BS article: {e}")
                            continue
                    
                    time.sleep(2)
                    
                except Exception as e:
                    logger.error(f"Error scraping BS URL {url}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error scraping Business Standard: {e}")
            
        logger.info(f"Scraped {len(articles)} articles from Business Standard")
        return articles

    def _extract_stock_symbols(self, text: str) -> List[str]:
        """Extract stock symbols from text"""
        found_stocks = []
        text_upper = text.upper()
        
        for symbol, names in self.stock_mapping.items():
            for name in names:
                if name.upper() in text_upper:
                    found_stocks.append(symbol)
                    break
        
        return list(set(found_stocks))

    def _analyze_sentiment(self, text: str) -> str:
        """Analyze sentiment of the text"""
        text_lower = text.lower()
        
        positive_count = sum(1 for word in self.positive_keywords if word in text_lower)
        negative_count = sum(1 for word in self.negative_keywords if word in text_lower)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'

    def _calculate_impact_score(self, sentiment: str, stock_count: int) -> float:
        """Calculate impact score based on sentiment and stock relevance"""
        base_score = {'positive': 0.7, 'negative': 0.6, 'neutral': 0.5}[sentiment]
        stock_bonus = min(stock_count * 0.1, 0.3)
        return min(base_score + stock_bonus, 1.0)

    def _parse_time_text(self, time_text: str) -> datetime:
        """Parse time text to datetime"""
        now = datetime.now()
        time_text = time_text.lower()
        
        if 'hour' in time_text:
            hours = int(re.search(r'\d+', time_text).group()) if re.search(r'\d+', time_text) else 1
            return now - timedelta(hours=hours)
        elif 'minute' in time_text:
            minutes = int(re.search(r'\d+', time_text).group()) if re.search(r'\d+', time_text) else 1
            return now - timedelta(minutes=minutes)
        elif 'day' in time_text:
            days = int(re.search(r'\d+', time_text).group()) if re.search(r'\d+', time_text) else 1
            return now - timedelta(days=days)
        else:
            return now

    def save_to_database(self, articles: List[NewsArticle]) -> int:
        """Save articles to database"""
        if not self.database_url:
            logger.warning("No database URL provided, skipping database save")
            return 0
            
        saved_count = 0
        try:
            conn = psycopg2.connect(self.database_url)
            cur = conn.cursor()
            
            for article in articles:
                try:
                    # Insert article
                    cur.execute("""
                        INSERT INTO news_articles (headline, summary, source, url, published_at, sentiment, impact_score)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (url) DO NOTHING
                        RETURNING id
                    """, (
                        article.headline,
                        article.summary,
                        article.source,
                        article.url,
                        article.published_at,
                        article.sentiment,
                        article.impact_score
                    ))
                    
                    result = cur.fetchone()
                    if result:
                        article_id = result[0]
                        
                        # Insert stock relevance
                        for stock in article.relevant_stocks:
                            cur.execute("""
                                INSERT INTO news_stock_relevance (news_id, stock_symbol, relevance_score)
                                VALUES (%s, %s, %s)
                                ON CONFLICT DO NOTHING
                            """, (article_id, stock, 0.8))
                        
                        saved_count += 1
                        
                except Exception as e:
                    logger.error(f"Error saving article to database: {e}")
                    conn.rollback()
                    continue
            
            conn.commit()
            cur.close()
            conn.close()
            
        except Exception as e:
            logger.error(f"Database error: {e}")
            
        logger.info(f"Saved {saved_count} articles to database")
        return saved_count

    def scrape_all_sources(self) -> List[NewsArticle]:
        """Scrape news from all sources"""
        all_articles = []
        
        # Scrape from all sources
        sources = [
            self.scrape_moneycontrol,
            self.scrape_economic_times,
            self.scrape_business_standard
        ]
        
        for scrape_func in sources:
            try:
                articles = scrape_func()
                all_articles.extend(articles)
            except Exception as e:
                logger.error(f"Error in {scrape_func.__name__}: {e}")
                continue
        
        # Remove duplicates based on headline similarity
        unique_articles = self._remove_duplicates(all_articles)
        
        # Sort by impact score and recency
        unique_articles.sort(key=lambda x: (x.impact_score, x.published_at), reverse=True)
        
        logger.info(f"Total unique articles scraped: {len(unique_articles)}")
        return unique_articles

    def _remove_duplicates(self, articles: List[NewsArticle]) -> List[NewsArticle]:
        """Remove duplicate articles based on headline similarity"""
        seen_headlines = set()
        unique_articles = []
        
        for article in articles:
            # Create a normalized version of the headline for comparison
            normalized = re.sub(r'[^a-zA-Z0-9\s]', '', article.headline.lower())
            normalized = ' '.join(normalized.split()[:10])  # First 10 words
            
            if normalized not in seen_headlines:
                seen_headlines.add(normalized)
                unique_articles.append(article)
        
        return unique_articles

    def save_to_json(self, articles: List[NewsArticle], filename: str = 'scraped_news.json'):
        """Save articles to JSON file"""
        try:
            data = []
            for article in articles:
                data.append({
                    'headline': article.headline,
                    'summary': article.summary,
                    'source': article.source,
                    'url': article.url,
                    'published_at': article.published_at.isoformat(),
                    'sentiment': article.sentiment,
                    'relevant_stocks': article.relevant_stocks,
                    'impact_score': article.impact_score
                })
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Saved {len(articles)} articles to {filename}")
            
        except Exception as e:
            logger.error(f"Error saving to JSON: {e}")

def main():
    """Main function to run the scraper"""
    scraper = IndianStockNewsScraper()
    
    logger.info("Starting news scraping process...")
    
    # Scrape all sources
    articles = scraper.scrape_all_sources()
    
    if articles:
        # Save to JSON file
        scraper.save_to_json(articles)
        
        # Save to database if URL is provided
        scraper.save_to_database(articles)
        
        # Print summary
        print(f"\n=== SCRAPING SUMMARY ===")
        print(f"Total articles scraped: {len(articles)}")
        print(f"Sources: Moneycontrol, Economic Times, Business Standard")
        
        # Sentiment breakdown
        positive = len([a for a in articles if a.sentiment == 'positive'])
        negative = len([a for a in articles if a.sentiment == 'negative'])
        neutral = len([a for a in articles if a.sentiment == 'neutral'])
        
        print(f"Sentiment breakdown: {positive} positive, {negative} negative, {neutral} neutral")
        
        # Top stocks mentioned
        stock_mentions = {}
        for article in articles:
            for stock in article.relevant_stocks:
                stock_mentions[stock] = stock_mentions.get(stock, 0) + 1
        
        if stock_mentions:
            top_stocks = sorted(stock_mentions.items(), key=lambda x: x[1], reverse=True)[:5]
            print(f"Top mentioned stocks: {', '.join([f'{stock}({count})' for stock, count in top_stocks])}")
        
        print("=== END SUMMARY ===\n")
        
    else:
        logger.warning("No articles were scraped")

if __name__ == "__main__":
    main()
