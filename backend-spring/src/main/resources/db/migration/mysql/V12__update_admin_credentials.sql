-- Replace the seeded demo admin login (admin@ivyts.dev / Password@123) with a short
-- username-style login the site owner asked for. `email` has no format check at the DB
-- layer, so a plain "admin" value is fine to store and look up by.
UPDATE users
SET email = 'admin',
    password_hash = '$2a$10$iOu7p4tIqcNXDBerQUk77eouBJAY/S5zjt6YvX.g/lzfDqnq20wOy'
WHERE id = 'adminmysql001';
