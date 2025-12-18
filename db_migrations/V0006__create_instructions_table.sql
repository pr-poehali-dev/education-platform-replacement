-- Создание таблицы для хранения инструкций
CREATE TABLE IF NOT EXISTS instructions (
    id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    profession VARCHAR(200) NOT NULL,
    content TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по категории
CREATE INDEX IF NOT EXISTS idx_instructions_category ON instructions(category);

-- Индекс для быстрого поиска по отрасли
CREATE INDEX IF NOT EXISTS idx_instructions_industry ON instructions(industry);
