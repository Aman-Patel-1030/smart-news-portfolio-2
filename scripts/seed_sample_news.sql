-- Seed sample news data for demonstration
-- This script populates the database with sample news articles

-- Insert sample news articles
INSERT INTO news_articles (headline, summary, source, url, published_at, sentiment, impact_score) VALUES
(
    'Sensex surges 500 points as IT stocks rally on strong Q3 results',
    'Indian benchmark indices closed higher led by IT and banking stocks after strong quarterly results from major companies. TCS and Infosys reported better-than-expected earnings.',
    'Economic Times',
    'https://economictimes.indiatimes.com/sample-url-1',
    NOW() - INTERVAL '2 hours',
    'positive',
    0.75
),
(
    'RBI maintains repo rate at 6.5%, signals cautious approach',
    'Reserve Bank of India keeps key interest rates unchanged while maintaining a cautious stance on inflation. Banking stocks showed mixed reactions.',
    'Moneycontrol',
    'https://moneycontrol.com/sample-url-2',
    NOW() - INTERVAL '4 hours',
    'neutral',
    0.50
),
(
    'Reliance Industries announces major expansion in renewable energy',
    'RIL commits ₹75,000 crore investment in green energy projects over the next 5 years. Stock price surged 3% on the announcement.',
    'Business Standard',
    'https://business-standard.com/sample-url-3',
    NOW() - INTERVAL '6 hours',
    'positive',
    0.80
),
(
    'Auto sector faces headwinds as chip shortage continues',
    'Major automakers report production delays due to semiconductor shortage. Maruti Suzuki and Tata Motors shares declined in early trading.',
    'Economic Times',
    'https://economictimes.indiatimes.com/sample-url-4',
    NOW() - INTERVAL '8 hours',
    'negative',
    0.65
),
(
    'Pharma stocks gain on strong export demand and new drug approvals',
    'Pharmaceutical companies see increased demand from international markets. Sun Pharma and Dr. Reddy\'s reported strong quarterly performance.',
    'Moneycontrol',
    'https://moneycontrol.com/sample-url-5',
    NOW() - INTERVAL '10 hours',
    'positive',
    0.70
);

-- Insert stock relevance data
INSERT INTO news_stock_relevance (news_id, stock_symbol, relevance_score) VALUES
-- News 1: IT stocks rally
(1, 'TCS', 0.90),
(1, 'INFY', 0.90),
(1, 'WIPRO', 0.85),
(1, 'HDFCBANK', 0.60),
(1, 'ICICIBANK', 0.60),

-- News 2: RBI rate decision
(2, 'HDFCBANK', 0.95),
(2, 'ICICIBANK', 0.95),
(2, 'SBIN', 0.90),

-- News 3: Reliance renewable energy
(3, 'RELIANCE', 0.95),

-- News 4: Auto sector challenges
(4, 'MARUTI', 0.90),
(4, 'TATAMOTORS', 0.85),
(4, 'M&M', 0.80),

-- News 5: Pharma sector gains
(5, 'SUNPHARMA', 0.90),
(5, 'DRREDDY', 0.85),
(5, 'CIPLA', 0.80);

-- Insert sample AI insights
DO $$
DECLARE
    demo_portfolio_id INTEGER;
    insight_id INTEGER;
BEGIN
    -- Get demo portfolio ID
    SELECT p.id INTO demo_portfolio_id 
    FROM portfolios p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.email = 'demo@example.com';
    
    -- Insert AI insight
    INSERT INTO ai_insights (
        portfolio_id, 
        overall_sentiment, 
        confidence_score, 
        key_insights, 
        recommendations
    ) VALUES (
        demo_portfolio_id,
        'positive',
        78,
        ARRAY[
            'IT sector showing strong momentum with positive Q3 results',
            'Banking sector remains stable despite rate concerns',
            'Energy sector benefiting from renewable energy investments',
            'Overall market sentiment is cautiously optimistic'
        ],
        ARRAY[
            'Consider holding IT stocks for continued growth potential',
            'Monitor banking sector for any policy changes',
            'Diversify into renewable energy themes',
            'Maintain stop-losses for risk management'
        ]
    ) RETURNING id INTO insight_id;
    
    -- Insert stock analysis
    INSERT INTO stock_analysis (insight_id, stock_symbol, impact, reasoning, confidence_score) VALUES
    (insight_id, 'TCS', 'positive', 'Strong Q3 results and positive IT sector outlook support continued growth', 85),
    (insight_id, 'RELIANCE', 'positive', 'Major renewable energy investment announcement drives positive sentiment', 80),
    (insight_id, 'HDFCBANK', 'neutral', 'Stable performance expected with unchanged interest rates', 70),
    (insight_id, 'INFY', 'positive', 'Benefiting from overall IT sector momentum and strong earnings', 82);
    
END $$;

-- Insert sample notifications
INSERT INTO user_notifications (user_id, title, message, type) 
SELECT u.id, 'Portfolio Alert', 'TCS stock surged 3% following strong Q3 results', 'positive'
FROM users u WHERE u.email = 'demo@example.com';

INSERT INTO user_notifications (user_id, title, message, type) 
SELECT u.id, 'Market Update', 'RBI maintains repo rate - neutral impact on banking stocks', 'neutral'
FROM users u WHERE u.email = 'demo@example.com';

COMMIT;
