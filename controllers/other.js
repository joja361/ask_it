import pool from "../db.js";

export const getPeopleWithMostReponses = async (req, res, next) => {
  const text = `
    WITH top_responders AS (
        SELECT user_id, COUNT(*) AS num_of_responses FROM responses
        GROUP BY user_id
        ORDER BY count(*) DESC
        LIMIT 5
      ) SELECT a.name, t.num_of_responses FROM account a
        JOIN top_responders t
        ON a.id = t.user_id
        ORDER BY t.num_of_responses desc;
    `;
  try {
    const { rows: peopleWithMostResponses } = await pool.query(text);
    res.send(peopleWithMostResponses);
  } catch (err) {
    next(err);
  }
};
