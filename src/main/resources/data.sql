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

-- Create default badges
INSERT INTO badges (id, code, name, description, icon_url) VALUES
(gen_random_uuid(), 'STREAK_7', 'Haftalık Savaşçı', '7 gün üst üste ders çalıştın!', '🔥'),
(gen_random_uuid(), 'STREAK_30', 'Odak Ustası', '30 gün üst üste ders çalıştın!', '👑'),
(gen_random_uuid(), 'FIRST_EXAM', 'İlk Adım', 'İlk deneme sınavını tamamladın!', '🎯'),
(gen_random_uuid(), 'POMODORO_MASTER', 'Zaman Yolcusu', 'Toplam 50 saat odaklandın!', '⌛');

-- Create admin user (password: admin123)
INSERT INTO users (id, name, email, password_hash, role, created_at, onboarding_completed) VALUES
('550e8400-e29b-41d4-a716-446655442000', 'Admin User', 'admin@focusflow.com', '$2a$10$aDKvABs6G3rH2JOG7W7L2O6eEn7DM8ZH0EhKpJ0qL3LM8N9O0P1Q2', 'ADMIN', CURRENT_TIMESTAMP, true);

-- Create student user (password: user123)
INSERT INTO users (id, name, email, password_hash, role, created_at, onboarding_completed) VALUES
('550e8400-e29b-41d4-a716-446655442001', 'Örnek Öğrenci', 'ogrenci@focusflow.com', '$2a$10$pE6L7uV0FpM/vKx2X8zW.uJ6V.uY6V.uY6V.uY6V.uY6V.uY6V.uY', 'USER', CURRENT_TIMESTAMP, true);

-- Seed profile for student
INSERT INTO user_profiles (id, user_id, target_tyt_net, target_ayt_net, daily_study_hours) VALUES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655442001', 90.0, 65.0, 6);
