DROP PROCEDURE IF EXISTS updateSchedule;

DELIMITER $$

CREATE PROCEDURE updateSchedule(IN cur_userId INT, IN new_Monday VARCHAR(100), IN new_Tuesday VARCHAR(100), IN new_Wednesday VARCHAR(100), IN new_Thursday VARCHAR(100), IN new_Friday VARCHAR(100), IN new_Saturday VARCHAR(100), IN new_Sunday VARCHAR(100))
BEGIN

UPDATE schedules SET Monday = new_Monday WHERE userId = cur_userId;
UPDATE schedules SET Tuesday = new_Tuesday WHERE userId = cur_userId;
UPDATE schedules SET Wednesday = new_Wednesday WHERE userId = cur_userId;
UPDATE schedules SET Thursday = new_Thursday WHERE userId = cur_userId;
UPDATE schedules SET Friday = new_Friday WHERE userId = cur_userId;
UPDATE schedules SET Saturday = new_Saturday WHERE userId = cur_userId;
UPDATE schedules SET Sunday = new_Sunday WHERE userId = cur_userId;

END $$

DELIMITER ;