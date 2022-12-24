DROP PROCEDURE IF EXISTS selectPurchased;

DELIMITER $$

CREATE PROCEDURE selectPurchased(IN cur_userId INT, IN cur_itemType INT) 
BEGIN

SELECT items.itemId, itemName FROM transactions
JOIN items
ON transactions.itemId = items.itemId 
WHERE userId = cur_userId
AND itemType = cur_itemType;

SELECT * FROM avatars WHERE userId=cur_userId;

END $$

DELIMITER ;