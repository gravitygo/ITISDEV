-- Unit Listing
SELECT unit_name,unit_symbol 
FROM unit 
WHERE is_disabled = '0';


-- Ingredient Listing
SELECT ingredient_name,unit_name 
FROM ingredients 
JOIN unit 
ON ingredient_base_unit = unit_id 
WHERE ingredients.is_disabled = '0';

SELECT * FROM ingredients;
-- Ingredient units Listing (ingredient_id = 1 for testing)
SELECT unit.unit_name, ingredient_units.multiplier 
FROM unit,ingredient_units 
WHERE unit.unit_id = ingredient_units.unit_id 
AND ingredient_units.ingredient_id = '1' 
AND ingredient_units.is_disabled = '0';

-- Menu Listing
SELECT dish_name, price 
FROM dish 
WHERE is_disabled = '0'
AND price != '0';
SELECT * FROM menu;

-- Menu ingredients Listing (menu_id = 1 for testing)
SELECT ingredients.ingredient_name, menu_ingredients.amount, unit.unit_name 
FROM ingredients 
JOIN menu_ingredients ON ingredients.ingredient_id = menu_ingredients.ingredient_id 
JOIN unit ON menu_ingredients.unit_id = unit.unit_id 
WHERE menu_ingredients.menu_id = '6' 
AND menu_ingredients.is_disabled = '0'
AND ingredients.is_disabled = '0';

