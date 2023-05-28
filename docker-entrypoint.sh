#!/bin/bash

set -e

echo "MySQL is up. Executing the script..."

mysql -h localhost -u root -ppassword <<EOSQL
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE DATABASE `mydb`;
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`USUARIO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`USUARIO` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dt_nascimento` DATE NULL,
  `bio` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `imagem` BLOB NULL,
  `imagem_url` VARCHAR(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `senha` VARCHAR(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE INDEX `id_usuario_UNIQUE` (`id_usuario` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`CLUBE`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`CLUBE` (
  `id_clube` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitulo` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `descricao` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `imagem` BLOB NULL,
  `imagem_url` VARCHAR(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `dt_criacao` DATE NULL,
  `categoria` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `site` VARCHAR(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `whatsapp` VARCHAR(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `telegram` VARCHAR(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `redes_sociais` TEXT NULL,
  PRIMARY KEY (`id_clube`),
  UNIQUE INDEX `id_clube_UNIQUE` (`id_clube` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`GENEROLIVRO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`GENEROLIVRO` (
  `cod_genero` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `descricao` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`cod_genero`),
  UNIQUE INDEX `cod_genero_UNIQUE` (`cod_genero` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`LIVRO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`LIVRO` (
  `id_livro` INT NOT NULL AUTO_INCREMENT,
  `isbn` VARCHAR(13) NULL,
  `titulo` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `edicao` INT NULL,
  `volume` INT NULL,
  `autor` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sinopse` VARCHAR(450) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dt_publicacao` DATE NULL,
  `img_capa` BLOB NULL,
  `img_capa_url` VARCHAR(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `GENEROLIVRO_cod_genero` INT NOT NULL,
  `LIVROcol` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`id_livro`),
  UNIQUE INDEX `isbn_UNIQUE` (`isbn` ASC) VISIBLE,
  INDEX `fk_LIVRO_GENEROLIVRO1_idx` (`GENEROLIVRO_cod_genero` ASC) VISIBLE,
  UNIQUE INDEX `id_livro_UNIQUE` (`id_livro` ASC) VISIBLE,
  CONSTRAINT `fk_LIVRO_GENEROLIVRO1`
    FOREIGN KEY (`GENEROLIVRO_cod_genero`)
    REFERENCES `mydb`.`GENEROLIVRO` (`cod_genero`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`ROLE`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`ROLE` (
  `cod_role` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`cod_role`),
  UNIQUE INDEX `cod_role_UNIQUE` (`cod_role` ASC) VISIBLE,
  UNIQUE INDEX `nome_UNIQUE` (`nome` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`LEITURA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`LEITURA` (
  `id_leitura` INT NOT NULL AUTO_INCREMENT,
  `dt_inicio` DATETIME NOT NULL,
  `dt_fim` DATETIME NOT NULL,
  `CLUBE_id_clube` INT NOT NULL,
  `LIVRO_id_livro` INT NOT NULL,
  PRIMARY KEY (`id_leitura`),
  UNIQUE INDEX `id_leitura_UNIQUE` (`id_leitura` ASC) VISIBLE,
  INDEX `fk_LEITURA_CLUBE1_idx` (`CLUBE_id_clube` ASC) VISIBLE,
  INDEX `fk_LEITURA_LIVRO1_idx` (`LIVRO_id_livro` ASC) VISIBLE,
  CONSTRAINT `fk_LEITURA_CLUBE1`
    FOREIGN KEY (`CLUBE_id_clube`)
    REFERENCES `mydb`.`CLUBE` (`id_clube`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_LEITURA_LIVRO1`
    FOREIGN KEY (`LIVRO_id_livro`)
    REFERENCES `mydb`.`LIVRO` (`id_livro`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`POSTAGEM`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`POSTAGEM` (
  `id_post` INT NOT NULL AUTO_INCREMENT,
  `dt_criacao` DATE NOT NULL,
  `conteudo` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `LEITURA_id_leitura` INT NOT NULL,
  `USUARIO_id_usuario` INT NOT NULL,
  PRIMARY KEY (`id_post`),
  UNIQUE INDEX `id_post_UNIQUE` (`id_post` ASC) VISIBLE,
  INDEX `fk_POSTAGEM_LEITURA1_idx` (`LEITURA_id_leitura` ASC) VISIBLE,
  INDEX `fk_POSTAGEM_USUARIO1_idx` (`USUARIO_id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_POSTAGEM_LEITURA1`
    FOREIGN KEY (`LEITURA_id_leitura`)
    REFERENCES `mydb`.`LEITURA` (`id_leitura`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_POSTAGEM_USUARIO1`
    FOREIGN KEY (`USUARIO_id_usuario`)
    REFERENCES `mydb`.`USUARIO` (`id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`MEMBRO_DO_CLUBE`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`MEMBRO_DO_CLUBE` (
  `CLUBE_id_clube` INT NOT NULL,
  `USUARIO_id_usuario` INT NOT NULL,
  `ROLE_cod_role` INT NOT NULL,
  PRIMARY KEY (`CLUBE_id_clube`, `USUARIO_id_usuario`, `ROLE_cod_role`),
  INDEX `fk_MEMBRO_CLUBE1_idx` (`CLUBE_id_clube` ASC) VISIBLE,
  INDEX `fk_MEMBRO_USUARIO1_idx` (`USUARIO_id_usuario` ASC) INVISIBLE,
  INDEX `fk_MEMBRO_ROLE1_idx` (`ROLE_cod_role` ASC) VISIBLE,
  CONSTRAINT `fk_MEMBROS_CLUBE1`
    FOREIGN KEY (`CLUBE_id_clube`)
    REFERENCES `mydb`.`CLUBE` (`id_clube`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_MEMBROS_USUARIO1`
    FOREIGN KEY (`USUARIO_id_usuario`)
    REFERENCES `mydb`.`USUARIO` (`id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_MEMBROS_ROLE1`
    FOREIGN KEY (`ROLE_cod_role`)
    REFERENCES `mydb`.`ROLE` (`cod_role`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`STATUS_ESPERA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`STATUS_ESPERA` (
  `cod_status` INT NOT NULL,
  `status` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Status = \n\n1xx - Status para CONVIDADOS\n101 - CONVITE ENVIADO | Convite enviado para novo usuario e aguardando\n102 - CONVITE ACEITO | Usuario convidado aceitou o convite \n102 - CONVITE RECUSADO | Convite foi recusado pelo usuario convidado\n\n2xx - Status de INTERESSADOS\n201 - SOLICITACAO ENVIADA | Interessado enviou solicitacao e aguarda aprovacao do moderador\n202 - SOLICITACAO APROVADA | Interessado teve sua solicitacao aprovada pelo moderador\n203 - SOLICITACAO NEGADA | Interessado teve sua solicitacao negada pelo moderador\n',
  PRIMARY KEY (`cod_status`),
  UNIQUE INDEX `cod_status_UNIQUE` (`cod_status` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`LISTA_ESPERA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`LISTA_ESPERA` (
  `id_listaespera` INT NOT NULL AUTO_INCREMENT,
  `convidado_email` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo = \n      CONVIDADO\n      INTERESSADO\n',
  `MEMBRO_DO_CLUBE_CLUBE_id_clube` INT NOT NULL,
  `MEMBRO_DO_CLUBE_ModeradorAdmin_id_usuario` INT NOT NULL,
  `MEMBRO_DO_CLUBE_ROLE_cod_role` INT NOT NULL,
  `STATUS_ESPERA_cod_status` INT NOT NULL,
  PRIMARY KEY (`id_listaespera`),
  UNIQUE INDEX `id_listaespera_UNIQUE` (`id_listaespera` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`convidado_email` ASC) VISIBLE,
  INDEX `fk_LISTA_ESPERA_MEMBRO_DO_CLUBE1_idx` (`MEMBRO_DO_CLUBE_CLUBE_id_clube` ASC, `MEMBRO_DO_CLUBE_ModeradorAdmin_id_usuario` ASC, `MEMBRO_DO_CLUBE_ROLE_cod_role` ASC) VISIBLE,
  INDEX `fk_LISTA_ESPERA_STATUS_ESPERA1_idx` (`STATUS_ESPERA_cod_status` ASC) VISIBLE,
  CONSTRAINT `fk_WAITLIST_MEMBRO_DO_CLUBE1`
    FOREIGN KEY (`MEMBRO_DO_CLUBE_CLUBE_id_clube` , `MEMBRO_DO_CLUBE_ModeradorAdmin_id_usuario` , `MEMBRO_DO_CLUBE_ROLE_cod_role`)
    REFERENCES `mydb`.`MEMBRO_DO_CLUBE` (`CLUBE_id_clube` , `USUARIO_id_usuario` , `ROLE_cod_role`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_LISTA_ESPERA_STATUS_ESPERA1`
    FOREIGN KEY (`STATUS_ESPERA_cod_status`)
    REFERENCES `mydb`.`STATUS_ESPERA` (`cod_status`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

INSERT INTO `mydb`.`ROLE` VALUES (1, 'Admin', 'Usuario moderador'), (2, 'Membro', 'Usuario participante ou leitor');

-- -----------------------------------------------------
-- Procedures
-- -----------------------------------------------------
DELIMITER $$
CREATE DEFINER=`root`@`%` PROCEDURE `mydb`.`SP_SELECT_DADOS_CLUBE_E_ROLE_SE_USUARIO_FOR_REGISTRADO`(
    IN varID_CLUBE INT, varID_USUARIO INT
)
BEGIN

        IF NOT EXISTS(SELECT 1 FROM CLUBE WHERE id_clube = varID_CLUBE) THEN
                SELECT 'CLUBE NAO ENCONTRADO' as NOT_CLUBE;
        ELSEIF EXISTS (SELECT 1 FROM MEMBRO_DO_CLUBE WHERE CLUBE_id_clube = varID_CLUBE AND USUARIO_id_usuario = varID_USUARIO) THEN
                SELECT
						C.id_clube as idClube,
                        C.nome as Nome,
                        C.subtitulo as Subtitulo,
                        C.descricao as Descricao,
                        C.imagem as Imagem,
                        C.imagem_url as Imagem_url,
                        C.site as Site,
                        C.whatsapp as Whatsapp,
                        C.telegram as Telegram,
                        C.redes_sociais as Redes_sociais,
                        MC.ROLE_cod_role as ROLE_cod_role
                FROM CLUBE AS C
                INNER JOIN MEMBRO_DO_CLUBE AS MC
                        ON C.id_clube = MC.CLUBE_id_clube
                INNER JOIN USUARIO AS U
                        ON U.id_usuario = MC.USUARIO_id_usuario
                WHERE
                        U.id_usuario = varID_USUARIO
                        AND C.id_clube = varID_CLUBE;
        ELSE
                SELECT 'USUARIO NAO FAZ PARTE DESTE CLUBE' AS NOT_USUARIO_PARTICIPANTE ;
        END IF;

END$$
DELIMITER ;

EOSQL

echo "Script executed successfully."