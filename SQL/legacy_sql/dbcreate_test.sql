-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema itisdev_db
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema itisdev_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `itisdev_db` DEFAULT CHARACTER SET utf8 ;
USE `itisdev_db` ;

-- -----------------------------------------------------
-- Table `itisdev_db`.`Account`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`Account` (
  `account_id` INT NOT NULL AUTO_INCREMENT,
  `fname` VARCHAR(45) NOT NULL,
  `lname` VARCHAR(45) NOT NULL,
  `password` TEXT NOT NULL,
  `role` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`account_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `itisdev_db`.`Order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`Order` (
  `order_id` INT NOT NULL AUTO_INCREMENT,
  `order_date` DATE NOT NULL,
  `account_id` INT NOT NULL,
  PRIMARY KEY (`order_id`),
  FOREIGN KEY (`account_id`) REFERENCES `Account`(`account_id`),
  INDEX `account_id_idx` (`account_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `itisdev_db`.`Menu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`Menu` (
  `menu_id` INT NOT NULL AUTO_INCREMENT,
  `menu_name` VARCHAR(45) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  `price` DECIMAL NOT NULL,
  PRIMARY KEY (`menu_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `itisdev_db`.`Order_List`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`Order_List` (
  `order_id` INT NOT NULL,
  `menu_id` INT NOT NULL,
  `amount` INT NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `Order`(`order_id`),
  FOREIGN KEY (`menu_id`) REFERENCES `Menu`(`menu_id`),
  INDEX `menu_id_idx` (`menu_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `itisdev_db`.`Ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`Ingredients` (
  `ingredient_id` INT NOT NULL AUTO_INCREMENT,
  `ingredient_base_unit` VARCHAR(45) NOT NULL,
  `amount` DOUBLE(15,5) NOT NULL,
  `ingredient_name` VARCHAR(45) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`ingredient_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `itisdev_db`.`Unit`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`Unit` (
  `unit_id` INT NOT NULL AUTO_INCREMENT,
  `unit_name` VARCHAR(45) NOT NULL,
  `unit_symbol` VARCHAR(5) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`unit_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `itisdev_db`.`Discard`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`Discard` (
  `discard_id` INT NOT NULL AUTO_INCREMENT,
  `ingredient_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  `account_id` INT NOT NULL,
  PRIMARY KEY (`discard_id`),
  FOREIGN KEY (`account_id`) REFERENCES `Account`(`account_id`),
  FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients`(`ingredient_id`),
  FOREIGN KEY (`unit_id`) REFERENCES `Unit`(`unit_id`),
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `itisdev_db`.`Restock`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`Restock` (
  `restock_id` INT NOT NULL AUTO_INCREMENT,
  `ingredient_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  `account_id` INT NOT NULL,
  PRIMARY KEY (`restock_id`),
  FOREIGN KEY (`account_id`) REFERENCES `Account`(`account_id`),
  FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients`(`ingredient_id`),
  FOREIGN KEY (`unit_id`) REFERENCES `Unit`(`unit_id`),
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `itisdev_db`.`Missing`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`Missing` (
  `missing_id` INT NOT NULL AUTO_INCREMENT,
  `ingredient_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  `account_id` INT NOT NULL,
  PRIMARY KEY (`missing_id`),
  FOREIGN KEY (`account_id`) REFERENCES `Account`(`account_id`),
  FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients`(`ingredient_id`),
  FOREIGN KEY (`unit_id`) REFERENCES `Unit`(`unit_id`),
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `itisdev_db`.`Missed_Opportunity`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`Missed_Opportunity` (
  `missed_opportunity_id` INT NOT NULL AUTO_INCREMENT,
  `ingredient_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  PRIMARY KEY (`missed_opportunity_id`),
  FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients`(`ingredient_id`),
  FOREIGN KEY (`unit_id`) REFERENCES `Unit`(`unit_id`),
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `itisdev_db`.`Menu_Ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`Menu_Ingredients` (
  `menu_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`menu_id`, `ingredient_id`, `unit_id`),
  FOREIGN KEY (`menu_id`) REFERENCES `Menu`(`menu_id`),
  FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients`(`ingredient_id`),
  FOREIGN KEY (`unit_id`) REFERENCES `Unit`(`unit_id`),
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `itisdev_db`.`Ingredient_Units`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`Ingredient_Units` (
  `ingredient_unit_id` INT NOT NULL AUTO_INCREMENT,
  `ingredient_id` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `multiplier` DOUBLE NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`ingredient_unit_id`),
  FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients`(`ingredient_id`),
  FOREIGN KEY (`unit_id`) REFERENCES `Unit`(`unit_id`),
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

INSERT INTO Account VALUES (1, 'Alain', 'Encarnacion', 'k8OJ5u18wM@S', 'Admin', 'AlainEncarnacion@gmail.com', 0); 
INSERT INTO Account VALUES (2, 'Steve', 'Rogers', '874!6m1RuQFb', 'Stock Controller', 'SteverRogers@gmail.com', 0); 
INSERT INTO Account VALUES (3, 'Bucky', 'Barnes', 'rcYP$75z8Pf@', 'Chef', 'PeterParker@gmail.com', 0); 
INSERT INTO Account VALUES (4, 'Peter', 'Parker', '3Dj!11sw*M8%', 'Cashier', 'BuckyBarnes@gmail.com', 0); 
INSERT INTO Account VALUES (5, 'Miles', 'Morales', '00koPKpVj5L$', 'Cashier', 'MilesMorales@gmail.com', 1); 

INSERT INTO Unit VALUES (1, 'gram', 'g', 0); 
INSERT INTO Unit VALUES (2, 'milliliter', 'ml', 0); 

INSERT INTO Ingredients VALUES (1, 1, 36, 'egg', 0); 
INSERT INTO Ingredients VALUES (2, 1, 10, 'beef', 0); 
INSERT INTO Ingredients VALUES (3, 1, 10, 'bacon', 0); 
INSERT INTO Ingredients VALUES (4, 1, 36, 'sausage', 0); 
INSERT INTO Ingredients VALUES (5, 1, 36000, 'flour', 0); 
INSERT INTO Ingredients VALUES (6, 1, 36, 'bun', 0); 
INSERT INTO Ingredients VALUES (7, 1, 10000, 'sugar', 0); 
INSERT INTO Ingredients VALUES (8, 1, 50, 'syrup', 0); 
INSERT INTO Ingredients VALUES (9, 1, 50, 'butter', 0); 
INSERT INTO Ingredients VALUES (10, 1, 10, 'salt', 0); 
INSERT INTO Ingredients VALUES (11, 1, 50, 'cheese', 0); 
INSERT INTO Ingredients VALUES (12, 1, 50, 'milk', 0); 

INSERT INTO Menu VALUES (1, 'Bacon and Eggs', 1, 350); 
INSERT INTO Menu VALUES (2, 'Pancakes', 0, 300); 
INSERT INTO Menu VALUES (3, 'Burger', 0, 275); 
INSERT INTO Menu VALUES (4, 'Omelette', 0, 200); 
INSERT INTO Menu VALUES (5, 'Sausage and Eggs', 0, 350); 
INSERT INTO Menu VALUES (6, 'Bacon and Eggs', 0, 350); 

INSERT INTO Ingredient_Units VALUES (1, 1, 1, 1, 0); 
INSERT INTO Ingredient_Units VALUES (2, 2, 1, 1, 0); 
INSERT INTO Ingredient_Units VALUES (3, 3, 1, 1, 0); 
INSERT INTO Ingredient_Units VALUES (4, 4, 1, 1, 0); 
INSERT INTO Ingredient_Units VALUES (5, 5, 1, 1, 0); 
INSERT INTO Ingredient_Units VALUES (6, 6, 1, 1, 0); 
INSERT INTO Ingredient_Units VALUES (7, 7, 1, 1, 0); 
INSERT INTO Ingredient_Units VALUES (8, 8, 1, 1, 0); 
INSERT INTO Ingredient_Units VALUES (9, 9, 1, 1, 0); 
INSERT INTO Ingredient_Units VALUES (10, 10, 1, 1, 0); 
INSERT INTO Ingredient_Units VALUES (11, 11, 1, 1, 0); 
INSERT INTO Ingredient_Units VALUES (12, 12, 1, 1, 0); 
INSERT INTO Ingredient_Units VALUES (13, 1, 2, 5, 0); 
INSERT INTO Ingredient_Units VALUES (14, 2, 2, 6, 0); 
INSERT INTO Ingredient_Units VALUES (15, 3, 2, 5, 0); 
INSERT INTO Ingredient_Units VALUES (16, 4, 2, 4, 0); 
INSERT INTO Ingredient_Units VALUES (17, 5, 2, 3, 0); 
INSERT INTO Ingredient_Units VALUES (18, 6, 2, 12, 0); 
INSERT INTO Ingredient_Units VALUES (19, 7, 2, 77, 0); 
INSERT INTO Ingredient_Units VALUES (20, 8, 2, 1234, 0); 
INSERT INTO Ingredient_Units VALUES (21, 9, 2, 43, 0); 
INSERT INTO Ingredient_Units VALUES (22, 10, 2, 23, 0); 
INSERT INTO Ingredient_Units VALUES (23, 11, 2, 3, 0); 
INSERT INTO Ingredient_Units VALUES (24, 12, 2, 2, 0); 

INSERT INTO Menu_Ingredients VALUES (1, 1, 1, 2, 1); 
INSERT INTO Menu_Ingredients VALUES (1, 3, 2, 2, 1); 
INSERT INTO Menu_Ingredients VALUES (2, 1, 2, 4, 0); 
INSERT INTO Menu_Ingredients VALUES (2, 5, 1, 150, 0); 
INSERT INTO Menu_Ingredients VALUES (2, 7, 1, 100, 0); 
INSERT INTO Menu_Ingredients VALUES (2, 8, 2, 2, 0); 
INSERT INTO Menu_Ingredients VALUES (3, 2, 2, 5, 0); 
INSERT INTO Menu_Ingredients VALUES (3, 6, 1, 2, 0); 

INSERT INTO `Order` VALUES (1, '2023-06-10', 1); 
INSERT INTO `Order` VALUES (2, '2023-06-20', 2); 
INSERT INTO `Order` VALUES (3, '2023-06-21', 3); 
INSERT INTO `Order` VALUES (4, '2023-06-23', 4); 
INSERT INTO `Order` VALUES (5, '2023-06-24', 5); 
INSERT INTO `Order` VALUES (6, '2023-06-24', 5); 

INSERT INTO Order_List VALUES (1, 1, 1); 
INSERT INTO Order_List VALUES (1, 2, 2); 
INSERT INTO Order_List VALUES (2, 1, 1); 
INSERT INTO Order_List VALUES (3, 3, 2); 
INSERT INTO Order_List VALUES (4, 1, 1); 
INSERT INTO Order_List VALUES (4, 2, 1); 
INSERT INTO Order_List VALUES (4, 3, 1); 
INSERT INTO Order_List VALUES (5, 3, 3); 
INSERT INTO Order_List VALUES (6, 2, 3); 

INSERT INTO `Discard` VALUES (1, 1, 5, 1, '2023-06-10', 2); 
INSERT INTO `Discard` VALUES (2, 2, 4, 2, '2023-06-20', 2); 
INSERT INTO `Discard` VALUES (3, 3, 3, 2, '2023-06-21', 2); 
INSERT INTO `Discard` VALUES (4, 4, 6, 1, '2023-06-23', 2); 
INSERT INTO `Discard` VALUES (5, 5, 19, 1, '2023-06-24', 2); 


INSERT INTO Restock VALUES (1, 1, 5, 1, '2023-06-10', 2); 
INSERT INTO Restock VALUES (2, 2, 4, 2, '2023-06-20', 2); 
INSERT INTO Restock VALUES (3, 3, 3, 2, '2023-06-21', 2); 
INSERT INTO Restock VALUES (4, 4, 6, 1, '2023-06-23', 2); 
INSERT INTO Restock VALUES (5, 5, 19, 1, '2023-06-24', 2); 

INSERT INTO Missing VALUES (1, 1, 5, 1, '2023-06-10', 2); 
INSERT INTO Missing VALUES (2, 2, 4, 2, '2023-06-20', 2); 
INSERT INTO Missing VALUES (3, 3, 3, 2, '2023-06-21', 2); 
INSERT INTO Missing VALUES (4, 4, 6, 1, '2023-06-23', 2); 
INSERT INTO Missing VALUES (5, 5, 19, 1, '2023-06-24', 2); 

INSERT INTO Missed_Opportunity VALUES (1, 1, 5, 1, '2023-06-10'); 
INSERT INTO Missed_Opportunity VALUES (2, 2, 4, 2, '2023-06-20'); 
INSERT INTO Missed_Opportunity VALUES (3, 3, 3, 2, '2023-06-21'); 
INSERT INTO Missed_Opportunity VALUES (4, 4, 6, 1, '2023-06-23'); 
INSERT INTO Missed_Opportunity VALUES (5, 5, 19, 1, '2023-06-24'); 


-- -----------------------------------------------------
-- Triggers
-- -----------------------------------------------------
DROP TRIGGER IF EXISTS `itisdev_db`.`restock_AFTER_INSERT`;

DELIMITER $$
USE `itisdev_db`$$
CREATE DEFINER= CURRENT_USER TRIGGER `restock_AFTER_INSERT` AFTER INSERT ON `restock` FOR EACH ROW BEGIN
	UPDATE ingredients
    SET
        amount = amount + (
            SELECT
                NEW.amount/iu.multiplier
            FROM
                ingredient_units iu
            WHERE
                iu.ingredient_id = NEW.ingredient_id
                AND iu.unit_id = NEW.unit_id
        )
    WHERE
        ingredient_id = NEW.ingredient_id;
END$$
DELIMITER ;


