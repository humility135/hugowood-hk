-- Remove the 4 specific hoodie products added previously
DELETE FROM products 
WHERE name IN (
    '90s Club De Fútbol Hoodie', 
    '1996 Football Club Tactical Hoodie', 
    'Hugo Wood Sports Club Hoodie', 
    'Number 9 Player Illustration Hoodie'
);
