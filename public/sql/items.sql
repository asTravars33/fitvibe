DROP TABLE IF EXISTS items;

CREATE TABLE items (itemId INT, itemName VARCHAR(100), itemCost INT, itemType INT, PRIMARY KEY(itemId));

INSERT INTO items VALUE (0, "skirt", 20, 1);
INSERT INTO items VALUE (1, "hair", 20, 1);
INSERT INTO items VALUE (2, "sunrise", 10, 3);
INSERT INTO items VALUE (3, "beach", 30, 2);
INSERT INTO items VALUE (4, "moon", 10, 3);
INSERT INTO items VALUE (5, "city", 10, 3);
INSERT INTO items VALUE (6, "coffee", 10, 3);
INSERT INTO items VALUE (7, "store", 10, 3);
INSERT INTO items VALUE (8, "umbrella", 10, 3);
INSERT INTO items VALUE (9, "forest", 30, 2);

DROP PROCEDURE IF EXISTS selectItems;

DELIMITER $$

CREATE PROCEDURE selectItems(IN cur_userId INT)
BEGIN

SELECT * FROM items WHERE itemType=1;
SELECT * FROM items WHERE itemType=2;
SELECT * FROM items WHERE itemType=3;
SELECT * FROM avatars WHERE userId=cur_userId;

END $$

DELIMITER ;