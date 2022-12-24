DROP TABLE IF EXISTS pathColors;

CREATE TABLE pathColors(userId INT, itemId INT, pathId VARCHAR(100), curColor VARCHAR(100));


DROP PROCEDURE IF EXISTS updatePathColors;

DELIMITER $$

CREATE PROCEDURE updatePathColors(IN cur_userId INT, IN cur_itemId INT, IN pathColors TEXT)
BEGIN

DECLARE entryEnd INT;
DECLARE pathIdEnd INT;
DECLARE entry VARCHAR(100);
DECLARE cur_pathId VARCHAR(100);
DECLARE cur_color VARCHAR(100);
DECLARE ind INT;
DECLARE cnt INT;

SET ind=0;

INSERT INTO debug5 VALUE (CONCAT("", cur_itemId));
INSERT INTO debug2 VALUE (CONCAT("cur_userId: ", cur_userId));
INSERT INTO debug2 VALUE (CONCAT("cur_itemId: ", cur_itemId));
INSERT INTO debug2 VALUE (CONCAT("pathColors: ", pathColors));

WHILE pathColors!="" DO

    INSERT INTO debug2 VALUE (CONCAT("Iteration: ", ind, " pathColors: ", pathColors));
    
    SET entryEnd = LOCATE(";", pathColors);
    SET entry = SUBSTRING(pathColors, 1, entryEnd-1);
    SET pathColors = SUBSTRING(pathColors, entryEnd+1);
    
    INSERT INTO debug2 VALUE (CONCAT("Iteration: ", ind, " entry: ", entry));
    
    SET pathIdEnd = LOCATE(":", entry);
    SET cur_pathId = SUBSTRING(entry, 1, pathIdEnd-1);
    SET cur_color = SUBSTRING(entry, pathIdEnd+1);
    
    INSERT INTO debug2 VALUE (CONCAT("Iteration: ", ind, " cur_pathId: ", cur_pathId));
    INSERT INTO debug2 VALUE (CONCAT("Iteration: ", ind, " cur_color: ", cur_color));
    
    SELECT COUNT(1) INTO cnt FROM pathColors WHERE userId = cur_userId AND pathId = cur_pathId;
    
    IF cnt>0 THEN
        UPDATE pathColors SET curColor = COCAT ("#", cur_color) WHERE userId = cur_userId AND pathId = cur_pathId;
    ELSE
        INSERT INTO pathColors VALUE (cur_userId, cur_itemId, cur_pathId, CONCAT("#",cur_color));
    END IF;
    
    INSERT INTO debug4 VALUE (CONCAT("", cur_userId));
    
    SET ind = ind+1;

END WHILE;
    
END $$

DELIMITER ;
