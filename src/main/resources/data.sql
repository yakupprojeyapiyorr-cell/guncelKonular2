-- Create initial lessons
INSERT INTO lessons (id, name, description, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Matematik', 'Matematik tüm konuları', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Türkçe', 'Türkçe tüm konuları', 2),
('550e8400-e29b-41d4-a716-446655440003', 'İngilizce', 'İngilizce tüm konuları', 3),
('550e8400-e29b-41d4-a716-446655440004', 'Fen Bilgisi', 'Fizik, Kimya, Biyoloji', 4),
('550e8400-e29b-41d4-a716-446655440005', 'Sosyal Bilgiler', 'Tarih ve Coğrafya', 5);

-- Create sample topics for Matematik
INSERT INTO topics (id, lesson_id, name, order_index) VALUES
('550e8400-e29b-41d4-a716-446655441001', '550e8400-e29b-41d4-a716-446655440001', 'Türev', 1),
('550e8400-e29b-41d4-a716-446655441002', '550e8400-e29b-41d4-a716-446655440001', 'İntegral', 2),
('550e8400-e29b-41d4-a716-446655441003', '550e8400-e29b-41d4-a716-446655440001', 'Limit', 3);

-- Create sample topics for Türkçe
INSERT INTO topics (id, lesson_id, name, order_index) VALUES
('550e8400-e29b-41d4-a716-446655441004', '550e8400-e29b-41d4-a716-446655440002', 'Sözcük Türleri', 1),
('550e8400-e29b-41d4-a716-446655441005', '550e8400-e29b-41d4-a716-446655440002', 'Cümle Yapısı', 2);

-- Create admin user (password: admin123 - hashed)
-- Password hash: $2a$10$aDKvABs6G3rH2JOG7W7L2O6eEn7DM8ZH0EhKpJ0qL3LM8N9O0P1Q2
INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES
('550e8400-e29b-41d4-a716-446655442000', 'Admin User', 'admin@focusflow.com', '$2a$10$aDKvABs6G3rH2JOG7W7L2O6eEn7DM8ZH0EhKpJ0qL3LM8N9O0P1Q2', 'ADMIN', CURRENT_TIMESTAMP);
