-- Site owner asked to switch the admin login back to a real email address (keeping the
-- admin1998 password set in V12 unchanged).
UPDATE users
SET email = 'admin@gmail.com'
WHERE id = 'adminmysql001';
