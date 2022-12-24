DROP TABLE IF EXISTS onExercise;
CREATE TABLE onExercise(url VARCHAR(100), userId INT);

DROP PROCEDURE IF EXISTS connectToExercise;
DELIMITER $$

CREATE PROCEDURE connectToExercise(IN cur_url VARCHAR(100), IN cur_userId INT)
BEGIN

INSERT INTO onExercise VALUE (cur_url, cur_userId);

SELECT skin, shirt, pants, shoes, hair FROM onExercise
JOIN avatars 
ON avatars.userId = onExercise.userId
WHERE url = cur_url;

END $$ 

DELIMITER ;
