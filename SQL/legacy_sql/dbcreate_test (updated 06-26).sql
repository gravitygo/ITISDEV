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
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8mb3 ;
-- -----------------------------------------------------
-- Schema itisdev_db
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema itisdev_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `itisdev_db` DEFAULT CHARACTER SET utf8mb3 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`account`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`account` (
  `account_id` INT NOT NULL AUTO_INCREMENT,
  `fname` VARCHAR(45) NOT NULL,
  `lname` VARCHAR(45) NOT NULL,
  `password` TEXT NOT NULL,
  `role` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`account_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 13
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`ingredient_units`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`ingredient_units` (
  `ingredient_id` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `multiplier` DOUBLE NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`ingredients` (
  `ingredient_id` INT NOT NULL,
  `ingredient_base_unit` VARCHAR(45) NOT NULL,
  `amount` INT NOT NULL,
  `ingredient_name` VARCHAR(45) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`ingredient_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`inventory_transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`inventory_transactions` (
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
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`menu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`menu` (
  `menu_id` INT NOT NULL,
  `menu_name` VARCHAR(45) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  `price` DECIMAL(10,0) NOT NULL,
  PRIMARY KEY (`menu_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`menu_ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`menu_ingredients` (
  `menu_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `ingredient_unit_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`missed_opportunity`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`missed_opportunity` (
  `missed_opportunity_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  PRIMARY KEY (`missed_opportunity_id`),
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`order` (
  `order_id` INT NOT NULL,
  `order_date` DATE NOT NULL,
  `account_id` INT NOT NULL,
  PRIMARY KEY (`order_id`),
  INDEX `account_id_idx` (`account_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`order_list`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`order_list` (
  `order_id` INT NOT NULL,
  `menu_id` INT NOT NULL,
  `amount` INT NOT NULL,
  PRIMARY KEY (`order_id`),
  INDEX `menu_id_idx` (`menu_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`unit`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`unit` (
  `unit_id` INT NOT NULL,
  `unit_name` VARCHAR(45) NOT NULL,
  `unit_symbol` VARCHAR(5) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`unit_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;

USE `itisdev_db` ;

-- -----------------------------------------------------
-- Table `itisdev_db`.`account`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`account` (
  `account_id` INT NOT NULL AUTO_INCREMENT,
  `fname` VARCHAR(45) NOT NULL,
  `lname` VARCHAR(45) NOT NULL,
  `password` TEXT NOT NULL,
  `role` VARCHAR(45) NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`account_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `itisdev_db`.`ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`ingredients` (
  `ingredient_id` INT NOT NULL,
  `ingredient_base_unit` VARCHAR(45) NOT NULL,
  `amount` INT NOT NULL,
  `ingredient_name` VARCHAR(45) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`ingredient_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `itisdev_db`.`unit`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`unit` (
  `unit_id` INT NOT NULL,
  `unit_name` VARCHAR(45) NOT NULL,
  `unit_symbol` VARCHAR(5) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`unit_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `itisdev_db`.`discard`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`discard` (
  `discard_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  `account_id` INT NOT NULL,
  PRIMARY KEY (`discard_id`),
  INDEX `account_id` (`account_id` ASC) VISIBLE,
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE,
  CONSTRAINT `discard_ibfk_1`
    FOREIGN KEY (`account_id`)
    REFERENCES `itisdev_db`.`account` (`account_id`),
  CONSTRAINT `discard_ibfk_2`
    FOREIGN KEY (`ingredient_id`)
    REFERENCES `itisdev_db`.`ingredients` (`ingredient_id`),
  CONSTRAINT `discard_ibfk_3`
    FOREIGN KEY (`unit_id`)
    REFERENCES `itisdev_db`.`unit` (`unit_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `itisdev_db`.`ingredient_units`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`ingredient_units` (
  `ingredient_unit_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `multiplier` DOUBLE NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`ingredient_unit_id`),
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE,
  CONSTRAINT `ingredient_units_ibfk_1`
    FOREIGN KEY (`ingredient_id`)
    REFERENCES `itisdev_db`.`ingredients` (`ingredient_id`),
  CONSTRAINT `ingredient_units_ibfk_2`
    FOREIGN KEY (`unit_id`)
    REFERENCES `itisdev_db`.`unit` (`unit_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `itisdev_db`.`menu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`menu` (
  `menu_id` INT NOT NULL,
  `menu_name` VARCHAR(45) NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  `price` DECIMAL(10,0) NOT NULL,
  PRIMARY KEY (`menu_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `itisdev_db`.`menu_ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`menu_ingredients` (
  `menu_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `is_disabled` TINYINT(1) NOT NULL,
  PRIMARY KEY (`menu_id`, `ingredient_id`, `unit_id`),
  INDEX `unit_id` (`unit_id` ASC) VISIBLE,
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  CONSTRAINT `menu_ingredients_ibfk_1`
    FOREIGN KEY (`menu_id`)
    REFERENCES `itisdev_db`.`menu` (`menu_id`),
  CONSTRAINT `menu_ingredients_ibfk_2`
    FOREIGN KEY (`ingredient_id`)
    REFERENCES `itisdev_db`.`ingredients` (`ingredient_id`),
  CONSTRAINT `menu_ingredients_ibfk_3`
    FOREIGN KEY (`unit_id`)
    REFERENCES `itisdev_db`.`unit` (`unit_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `itisdev_db`.`missed_opportunity`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`missed_opportunity` (
  `missed_opportunity_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  PRIMARY KEY (`missed_opportunity_id`),
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE,
  CONSTRAINT `missed_opportunity_ibfk_1`
    FOREIGN KEY (`ingredient_id`)
    REFERENCES `itisdev_db`.`ingredients` (`ingredient_id`),
  CONSTRAINT `missed_opportunity_ibfk_2`
    FOREIGN KEY (`unit_id`)
    REFERENCES `itisdev_db`.`unit` (`unit_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `itisdev_db`.`missing`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`missing` (
  `missing_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  `account_id` INT NOT NULL,
  PRIMARY KEY (`missing_id`),
  INDEX `account_id` (`account_id` ASC) VISIBLE,
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE,
  CONSTRAINT `missing_ibfk_1`
    FOREIGN KEY (`account_id`)
    REFERENCES `itisdev_db`.`account` (`account_id`),
  CONSTRAINT `missing_ibfk_2`
    FOREIGN KEY (`ingredient_id`)
    REFERENCES `itisdev_db`.`ingredients` (`ingredient_id`),
  CONSTRAINT `missing_ibfk_3`
    FOREIGN KEY (`unit_id`)
    REFERENCES `itisdev_db`.`unit` (`unit_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `itisdev_db`.`order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`order` (
  `order_id` INT NOT NULL,
  `order_date` DATE NOT NULL,
  `account_id` INT NOT NULL,
  PRIMARY KEY (`order_id`),
  INDEX `account_id_idx` (`account_id` ASC) VISIBLE,
  CONSTRAINT `order_ibfk_1`
    FOREIGN KEY (`account_id`)
    REFERENCES `itisdev_db`.`account` (`account_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `itisdev_db`.`order_list`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`order_list` (
  `order_id` INT NOT NULL,
  `menu_id` INT NOT NULL,
  `amount` INT NOT NULL,
  INDEX `order_id` (`order_id` ASC) VISIBLE,
  INDEX `menu_id_idx` (`menu_id` ASC) VISIBLE,
  CONSTRAINT `order_list_ibfk_1`
    FOREIGN KEY (`order_id`)
    REFERENCES `itisdev_db`.`order` (`order_id`),
  CONSTRAINT `order_list_ibfk_2`
    FOREIGN KEY (`menu_id`)
    REFERENCES `itisdev_db`.`menu` (`menu_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `itisdev_db`.`restock`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itisdev_db`.`restock` (
  `restock_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  `account_id` INT NOT NULL,
  PRIMARY KEY (`restock_id`),
  INDEX `account_id` (`account_id` ASC) VISIBLE,
  INDEX `ingredient_id_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `unit_id_idx` (`unit_id` ASC) VISIBLE,
  CONSTRAINT `restock_ibfk_1`
    FOREIGN KEY (`account_id`)
    REFERENCES `itisdev_db`.`account` (`account_id`),
  CONSTRAINT `restock_ibfk_2`
    FOREIGN KEY (`ingredient_id`)
    REFERENCES `itisdev_db`.`ingredients` (`ingredient_id`),
  CONSTRAINT `restock_ibfk_3`
    FOREIGN KEY (`unit_id`)
    REFERENCES `itisdev_db`.`unit` (`unit_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
