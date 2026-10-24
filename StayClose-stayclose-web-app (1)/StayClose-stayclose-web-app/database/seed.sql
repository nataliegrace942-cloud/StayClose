-- ============================================================
--  STAYCLOSE — Sample data
--  Demo login: gwen@stayclose.com / password123
-- ============================================================
USE stayclose;

INSERT INTO room_types (id, name, multiplier) VALUES
  ('standard', 'Standard Room', 1.00),
  ('deluxe',   'Deluxe Room',   1.25),
  ('premium',  'Premium Suite', 1.50);

INSERT INTO hotels (id, name, address, city, rating, reviews, price, tint, amenities) VALUES
  ('hot_paw',  'Paw Paradise Hotel',   'Jl. Paws Avenue No. 10, Jakarta Selatan', 'Jakarta',    4.9, 120, 120000, '#A9C9B0', JSON_ARRAY('24/7 CCTV','Vet on call','Play area','Grooming')),
  ('hot_tail', 'Happy Tails Retreat',  'Jl. Kemang Raya No. 21, Jakarta Selatan', 'Jakarta',    4.8,  97,  90000, '#D9C4A5', JSON_ARRAY('24/7 CCTV','Garden','Pool')),
  ('hot_fur',  'Furry Friends Inn',    'Jl. Dago No. 88, Bandung',                'Bandung',    4.7,  84, 110000, '#B9CBD9', JSON_ARRAY('24/7 CCTV','Cat lounge','Daily report')),
  ('hot_wag',  'Wag & Whisker Lodge',  'Jl. Sunset Road No. 5, Bali',             'Bali',       4.9, 156, 150000, '#C8D9B9', JSON_ARRAY('24/7 CCTV','Beach walks','Spa')),
  ('hot_cozy', 'Cozy Paws Suites',     'Jl. Pemuda No. 12, Surabaya',             'Surabaya',   4.6,  63,  85000, '#E3CDB8', JSON_ARRAY('24/7 CCTV','Quiet rooms')),
  ('hot_bark', 'Barkingham Palace',    'Jl. Malioboro No. 3, Yogyakarta',         'Yogyakarta', 4.8, 110, 135000, '#BFD3CF', JSON_ARRAY('24/7 CCTV','Agility park','Vet on call'));

INSERT INTO cameras (id, hotel_id, name, scene) VALUES
  ('cam_0', 'hot_paw', 'Play Area',   'play'),
  ('cam_1', 'hot_paw', 'Nap Zone',    'nap'),
  ('cam_2', 'hot_paw', 'Dining Area', 'dining'),
  ('cam_3', 'hot_paw', 'Garden',      'garden'),
  ('cam_4', 'hot_paw', 'Cat Lounge',  'lounge');

-- password_hash = SHA-256('demo_salt_01:password123'), same scheme as js/db.js
INSERT INTO users (id, name, first_name, email, phone, avatar, role, salt, password_hash) VALUES
  ('usr_demo',  'Gwen Stacy', 'Gwen', 'gwen@stayclose.com', '+62 812 3456 7890', '👩🏻', 'owner', 'demo_salt_01', SHA2('demo_salt_01:password123', 256)),
  ('usr_staff', 'Rina Putri', 'Rina', 'rina@pawparadise.id', '+62 811 1111 2222', '👩🏻‍⚕️', 'staff', 'demo_salt_02', SHA2('demo_salt_02:password123', 256));

INSERT INTO user_settings (id, user_id) VALUES ('set_usr_demo', 'usr_demo'), ('set_usr_staff', 'usr_staff');

INSERT INTO pets (id, user_id, name, species, breed, age, gender, weight, emoji, color, notes, status, mood) VALUES
  ('pet_brownie', 'usr_demo', 'Brownie', 'Dog', 'Golden Retriever',   2, 'Male',   28.0, '🐶',   'linear-gradient(135deg,#F6D7A7,#E9B872)', 'Loves tennis balls. Allergic to chicken.', 'At the hotel', 'Playing happily'),
  ('pet_luna',    'usr_demo', 'Luna',    'Cat', 'Domestic Shorthair', 3, 'Female',  4.2, '🐱',   'linear-gradient(135deg,#E8E4DE,#C9C2B8)', 'Shy with strangers, likes window seats.', 'At the hotel', 'Sleeping well'),
  ('pet_blacky',  'usr_demo', 'Blacky',  'Cat', 'Bombay',             4, 'Male',    5.0, '🐈‍⬛', 'linear-gradient(135deg,#B8B2A8,#857D73)', 'Napping champion.',                      'At the hotel', 'Taking a nap');

INSERT INTO bookings (id, user_id, hotel_id, code, room_type, check_in, check_out, status, total) VALUES
  ('bk_active',   'usr_demo', 'hot_paw',  'SC-2026-0321', 'premium',  CURDATE() - INTERVAL 1 DAY,  CURDATE() + INTERVAL 2 DAY,  'active',    149850),
  ('bk_upcoming', 'usr_demo', 'hot_wag',  'SC-2026-0410', 'deluxe',   CURDATE() + INTERVAL 20 DAY, CURDATE() + INTERVAL 23 DAY, 'upcoming',  416250),
  ('bk_past',     'usr_demo', 'hot_tail', 'SC-2026-0118', 'standard', CURDATE() - INTERVAL 60 DAY, CURDATE() - INTERVAL 57 DAY, 'completed', 299700);

INSERT INTO booking_pets (id, booking_id, pet_id) VALUES
  ('bp_1', 'bk_active', 'pet_brownie'), ('bp_2', 'bk_active', 'pet_luna'), ('bp_3', 'bk_active', 'pet_blacky'),
  ('bp_4', 'bk_upcoming', 'pet_brownie'), ('bp_5', 'bk_past', 'pet_luna');

INSERT INTO payments (id, booking_id, method, amount, status, paid_at) VALUES
  ('pay_1', 'bk_active',   'qris', 149850, 'paid', NOW() - INTERVAL 2 DAY),
  ('pay_2', 'bk_upcoming', 'card', 416250, 'paid', NOW() - INTERVAL 1 DAY),
  ('pay_3', 'bk_past',     'bank', 299700, 'paid', NOW() - INTERVAL 61 DAY);

INSERT INTO activities (id, pet_id, booking_id, type, title, description, location, occurred_at) VALUES
  ('act_01', 'pet_brownie', 'bk_active', 'meal',  'Breakfast completed', 'Brownie finished all his food',       'Dining Area', CURDATE() + INTERVAL 480 MINUTE),
  ('act_02', 'pet_brownie', 'bk_active', 'play',  'Morning playtime',    'Played in the yard with other pets',  'Play Area',   CURDATE() + INTERVAL 600 MINUTE),
  ('act_03', 'pet_brownie', 'bk_active', 'sleep', 'Nap time',            'Took a nap in the nap zone',          'Nap Zone',    CURDATE() + INTERVAL 705 MINUTE),
  ('act_04', 'pet_brownie', 'bk_active', 'walk',  'Afternoon walk',      'Short walk and outdoor time',         'Garden',      CURDATE() + INTERVAL 900 MINUTE),
  ('act_05', 'pet_brownie', 'bk_active', 'snack', 'Snack time',          'Had some treats and water',           'Dining Area', CURDATE() + INTERVAL 1020 MINUTE),
  ('act_06', 'pet_brownie', 'bk_active', 'rest',  'Resting',             'Now resting comfortably',             'Nap Zone',    CURDATE() + INTERVAL 1140 MINUTE),
  ('act_07', 'pet_luna',    'bk_active', 'meal',  'Breakfast completed', 'Luna finished breakfast',             'Dining Area', CURDATE() + INTERVAL 490 MINUTE),
  ('act_08', 'pet_luna',    'bk_active', 'play',  'Played outside',      'Chased a feather toy',                'Play Area',   CURDATE() + INTERVAL 760 MINUTE),
  ('act_09', 'pet_luna',    'bk_active', 'sleep', 'Window nap',          'Sleeping in the sun',                 'Cat Lounge',  CURDATE() + INTERVAL 840 MINUTE),
  ('act_10', 'pet_blacky',  'bk_active', 'meal',  'Breakfast completed', 'Ate half, finished later',            'Dining Area', CURDATE() + INTERVAL 500 MINUTE),
  ('act_11', 'pet_blacky',  'bk_active', 'sleep', 'Taking a nap',        'Curled up in his bed',                'Nap Zone',    CURDATE() + INTERVAL 780 MINUTE);

INSERT INTO notifications (id, user_id, pet_id, type, title, body, detail, location, `read`, at) VALUES
  ('n_1', 'usr_demo', 'pet_brownie', 'alert',  'Emergency Alert',                       'Brownie needs immediate attention', 'Brownie has a minor irritation. Our team is monitoring and providing care.', 'Paw Paradise Veterinary', FALSE, NOW() - INTERVAL 2 MINUTE),
  ('n_2', 'usr_demo', 'pet_brownie', 'update', 'Brownie is playing happily!',           'Play Area',   NULL, NULL, FALSE, NOW() - INTERVAL 55 MINUTE),
  ('n_3', 'usr_demo', 'pet_brownie', 'update', 'Brownie finished breakfast!',           'Dining Area', NULL, NULL, FALSE, NOW() - INTERVAL 2 HOUR),
  ('n_4', 'usr_demo', 'pet_luna',    'update', 'Luna played outside.',                  'Play Area',   NULL, NULL, FALSE, NOW() - INTERVAL 4 HOUR),
  ('n_5', 'usr_demo', 'pet_blacky',  'update', 'Blacky is taking a nap.',               'Nap Zone',    NULL, NULL, FALSE, NOW() - INTERVAL 6 HOUR),
  ('n_6', 'usr_demo', NULL,          'update', 'Staff uploaded today''s activity report.', 'You can now view the full report.', NULL, NULL, TRUE, NOW() - INTERVAL 22 HOUR),
  ('n_7', 'usr_demo', NULL,          'promo',  '20% off grooming this weekend 🎉',      'Use code SPA20 at Paw Paradise Hotel.', NULL, NULL, TRUE, NOW() - INTERVAL 26 HOUR);

INSERT INTO messages (id, user_id, hotel_id, sender, body, at) VALUES
  ('m_1', 'usr_demo', 'hot_paw', 'staff', 'Hi! 👋 This is Rina from Paw Paradise. How can we help you today?', NOW() - INTERVAL 30 MINUTE);
