-- Create database schema for Smart News Portfolio
-- This script sets up tables for storing news, portfolios, and user data

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'My Portfolio',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create portfolio_holdings table
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    avg_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    headline TEXT NOT NULL,
    summary TEXT,
    source VARCHAR(100) NOT NULL,
    url TEXT,
    published_at TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sentiment VARCHAR(20) DEFAULT 'neutral',
    impact_score DECIMAL(3, 2) DEFAULT 0.0
);

-- Create news_stock_relevance table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS news_stock_relevance (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news_articles(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(20) NOT NULL,
    relevance_score DECIMAL(3, 2) DEFAULT 0.0
);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    overall_sentiment VARCHAR(20),
    confidence_score INTEGER,
    key_insights TEXT[],
    recommendations TEXT[],
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stock_analysis table
CREATE TABLE IF NOT EXISTS stock_analysis (
    id SERIAL PRIMARY KEY,
    insight_id INTEGER REFERENCES ai_insights(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(20) NOT NULL,
    impact VARCHAR(20),
    reasoning TEXT,
    confidence_score INTEGER
);

-- Create user_notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio_id ON portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_stock_symbol ON portfolio_holdings(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_sentiment ON news_articles(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_stock_relevance_news_id ON news_stock_relevance(news_id);
CREATE INDEX IF NOT EXISTS idx_news_stock_relevance_stock_symbol ON news_stock_relevance(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

-- Insert sample data
INSERT INTO users (email, name) VALUES 
('demo@example.com', 'Demo User')
ON CONFLICT (email) DO NOTHING;

-- Get the demo user ID
DO $$
DECLARE
    demo_user_id INTEGER;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@example.com';
    
    -- Insert sample portfolio
    INSERT INTO portfolios (user_id, name) VALUES 
    (demo_user_id, 'Demo Portfolio')
    ON CONFLICT DO NOTHING;
    
    -- Insert sample holdings
    INSERT INTO portfolio_holdings (portfolio_id, stock_symbol, quantity, avg_price)
    SELECT p.id, 'TCS', 50, 3500.00
    FROM portfolios p WHERE p.user_id = demo_user_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO portfolio_holdings (portfolio_id, stock_symbol, quantity, avg_price)
    SELECT p.id, 'RELIANCE', 25, 2800.00
    FROM portfolios p WHERE p.user_id = demo_user_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO portfolio_holdings (portfolio_id, stock_symbol, quantity, avg_price)
    SELECT p.id, 'HDFCBANK', 30, 1650.00
    FROM portfolios p WHERE p.user_id = demo_user_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO portfolio_holdings (portfolio_id, stock_symbol, quantity, avg_price)
    SELECT p.id, 'INFY', 40, 1450.00
    FROM portfolios p WHERE p.user_id = demo_user_id
    ON CONFLICT DO NOTHING;
END $$;

COMMIT;
