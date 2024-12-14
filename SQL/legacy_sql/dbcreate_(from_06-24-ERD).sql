-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`Account`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Account` (
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
-- Table `mydb`.`Order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Order` (
  `order_id` INT NOT NULL,
  `order_date` DATE NOT NULL,
  `account_id` INT NOT NULL,
  PRIMARY KEY (`order_id`),
  INDEX `account_id_idx` (`account_id` ASC) VISIBLE,
  CONSTRAINT `account_id`
    FOREIGN KEY (`account_id`)
    REFERENCES `mydb`.`Account` (`account_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Menu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Menu` (
  `menu_id` INT NOT NULL,
  `menu_name` VARCHAR(45) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  `price` DECIMAL NOT NULL,
  PRIMARY KEY (`menu_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Order_List`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Order_List` (
  `order_id` INT NOT NULL,
  `menu_id` INT NOT NULL,
  `amount` INT NOT NULL,
  PRIMARY KEY (`order_id`),
  INDEX `menu_id_idx` (`menu_id` ASC) VISIBLE,
  CONSTRAINT `order_id`
    FOREIGN KEY (`order_id`)
    REFERENCES `mydb`.`Order` (`order_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `menu_id`
    FOREIGN KEY (`menu_id`)
    REFERENCES `mydb`.`Menu` (`menu_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Ingredients` (
  `ingredient_id` INT NOT NULL,
  `ingredient_base_unit` VARCHAR(45) NOT NULL,
  `amount` INT NOT NULL,
  `ingredient_name` VARCHAR(45) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`ingredient_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Unit`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Unit` (
  `unit_id` INT NOT NULL,
  `unit_name` VARCHAR(45) NOT NULL,
  `unit_symbol` VARCHAR(5) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`unit_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Inventory_Transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Inventory_Transactions` (
  `inventory_transaction_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `process` VARCHAR(45) NOT NULL,
  `unit_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  `transaction_user` VARCHAR(45) NOT NULL,
  `account_id` INT NOT NULL,
  PRIMARY KEY (`inventory_transaction_id`, `ingredient_id`),
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE,
  CONSTRAINT `ingredient_id`
    FOREIGN KEY (`ingredient_id`)
    REFERENCES `mydb`.`Ingredients` (`ingredient_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `unit_id`
    FOREIGN KEY (`unit_id`)
    REFERENCES `mydb`.`Unit` (`unit_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Missed_Opportunity`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Missed_Opportunity` (
  `missed_opportunity_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  PRIMARY KEY (`missed_opportunity_id`),
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE,
  CONSTRAINT `ingredient_id`
    FOREIGN KEY (`ingredient_id`)
    REFERENCES `mydb`.`Ingredients` (`ingredient_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `unit_id`
    FOREIGN KEY (`unit_id`)
    REFERENCES `mydb`.`Unit` (`unit_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Menu_Ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Menu_Ingredients` (
  `menu_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `ingredient_unit_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  CONSTRAINT `menu_id`
    FOREIGN KEY (`menu_id`)
    REFERENCES `mydb`.`Menu` (`menu_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `ingredient_id`
    FOREIGN KEY (`ingredient_id`)
    REFERENCES `mydb`.`Ingredients` (`ingredient_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Ingredient_Units`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Ingredient_Units` (
  `ingredient_id` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `multiplier` DOUBLE NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE,
  CONSTRAINT `ingredient_id`
    FOREIGN KEY (`ingredient_id`)
    REFERENCES `mydb`.`Ingredients` (`ingredient_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `unit_id`
    FOREIGN KEY (`unit_id`)
    REFERENCES `mydb`.`Unit` (`unit_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
