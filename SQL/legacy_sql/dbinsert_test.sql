
-- Insert menu item
INSERT INTO menu(menu_id,menu_name,price,is_disabled) VALUES ('1','adobo','100','0');
INSERT INTO menu(menu_id,menu_name,price,is_disabled) VALUES ('2','sinigang','200','0');

-- Insert unit in table
INSERT INTO unit(unit_id,unit_name,unit_symbol,is_disabled) VALUES ('1','Kilogram','kg','0');
INSERT INTO unit(unit_id,unit_name,unit_symbol,is_disabled) VALUES ('2','Pounds','lbs','0');

-- Insert ingredients in table
INSERT INTO ingredients(ingredient_id,ingredient_base_unit,amount,ingredient_name,is_disabled) VALUES ('1','kg','100','Kangkong','0');
INSERT INTO ingredients(ingredient_id,ingredient_base_unit,amount,ingredient_name,is_disabled) VALUES ('2','lbs','50','Bagoong','0');


-- Insert ingredient units
INSERT INTO ingredient_units(ingredient_id,unit_id,multiplier,is_disabled) VALUES ('1','1','1','0');
INSERT INTO ingredient_units(ingredient_id,unit_id,multiplier,is_disabled) VALUES ('1','2','2.2','0');
INSERT INTO ingredient_units(ingredient_id,unit_id,multiplier,is_disabled) VALUES ('2','2','1','0');


-- Insert menu ingredient
INSERT INTO menu_ingredients(menu_id,ingredient_id,ingredient_unit_id,amount,is_disabled) VALUES ('1','2','1','5','0');
INSERT INTO menu_ingredients(menu_id,ingredient_id,ingredient_unit_id,amount,is_disabled) VALUES ('2','2','1','15','0');
-- Disabled menu ingredient
INSERT INTO menu_ingredients(menu_id,ingredient_id,ingredient_unit_id,amount,is_disabled) VALUES ('1','1','1','1','1');




