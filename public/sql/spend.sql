DROP PROCEDURE IF EXISTS spend;

DELIMITER $$

CREATE PROCEDURE spend(IN cur_userId INT, IN cur_itemId INT, IN cost INT, IN cur_itemType INT, IN cur_itemName VARCHAR(100))
BEGIN

DECLARE prev_coins INT;
DECLARE cnt INT;

SELECT coins INTO prev_coins FROM users WHERE userId = cur_userId;

IF prev_coins-cost>=0 THEN
    UPDATE users SET coins = coins-cost WHERE userId = cur_userId;
    SELECT COUNT(1) INTO cnt FROM transactions WHERE userId = cur_userId AND itemId = cur_itemId;
    IF cnt<=0 THEN
        IF cur_itemType = 1 THEN
            PREPARE command FROM CONCAT('UPDATE avatars SET ', cur_itemName, ' = "#ffffff" WHERE userId = ', cur_userId, ";");
            EXECUTE command;
            DEALLOCATE PREPARE command;
        ELSE
            INSERT INTO transactions VALUE (cur_userId, cur_itemId);
        END IF;
    END IF;
END IF;

SELECT coins FROM users WHERE userId = cur_userId;

END $$

DELIMITER ;