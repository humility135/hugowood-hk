
-- Update specific products to 'Football Collection'
UPDATE products SET series = 'Football Collection' WHERE name IN ('Matt Orr', 'Club de Fútbol', '1996 Football Club', 'HUGOWOOD Sport Club');

-- Update others to 'Classic Collection'
UPDATE products SET series = 'Classic Collection' WHERE name NOT IN ('Matt Orr', 'Club de Fútbol', '1996 Football Club', 'HUGOWOOD Sport Club');
