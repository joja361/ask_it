import pool from "../db.js";

export const createQuestion = async (req, res, next) => {
  const { question, description } = req.body;

  const text =
    "INSERT INTO questions (user_id, question, description) VALUES ($1, $2, $3);";
  try {
    await pool.query(text, [req.userId, question, description]);
    return res.send();
  } catch (err) {
    next(err);
  }
};

export const likeQuestion = async (req, res, next) => {
  const { id: questionId } = req.params;

  const text =
    "INSERT INTO question_likes (user_id, question_id) VALUES ($1, $2);";
  try {
    await pool.query(text, [req.userId, questionId]);
    res.send();
  } catch (err) {
    next(err);
  }
};

export const createResponse = async (req, res, next) => {
  const { id: questionId } = req.params;
  const { response } = req.body;

  const text =
    "INSERT INTO responses (user_id, question_id, response) VALUES ($1, $2, $3);";
  try {
    await pool.query(text, [req.userId, questionId, response]);
    res.send();
  } catch (err) {
    next(err);
  }
};

export const getQuestions = async (req, res, next) => {
  const { last, mostLiked } = req.query;

  if (last) {
    const getLastQuestions =
      last > 5 ? `OFFSET ${last - 5} LIMIT 5` : `LIMIT 5`;
    const text = `
      SELECT a.name, a.email, q.id, q.question, q.description,  q.created_at FROM questions q 
      LEFT JOIN account a 
      ON q.user_id = a.id 
      ORDER BY q.created_at DESC 
      ${getLastQuestions}`;

    try {
      const { rows: questions } = await pool.query(text);
      return res.send(questions);
    } catch (err) {
      return next(err);
    }
  }

  if (mostLiked === "true") {
    const text = `WITH top_5_questions AS (
            WITH most_liked_questions AS ( 
                SELECT question_id, COUNT(*) AS num_of_likes FROM question_likes
                GROUP BY question_id
                ORDER BY COUNT(*) DESC
                LIMIT 5
            ) SELECT q.user_id, q.question, q.created_at, mlq.num_of_likes FROM questions q
                JOIN most_liked_questions mlq 
                ON q.id = mlq.question_id
        ) SELECT a.email, a.name, top5.question, top5.created_at, top5.num_of_likes FROM account a
            JOIN top_5_questions top5 
            ON a.id = top5.user_id
            ORDER BY top5.num_of_likes DESC
        ;`;
    try {
      const { rows: top5Questions } = await pool.query(text);
      return res.send(top5Questions);
    } catch (err) {
      return next(err);
    }
  }
  //CHECK ABOUT THIS OPTIONAL QUERIES IS IT GOOD PRACTICE AND ERROR HANDELING FOR THIS CASES
  const error = new Error("You enter something wrong in URL");
  error.statusCode = 400;
  next(error);
};

export const getQuestion = async (req, res, next) => {
  const { id: questionId } = req.params;

  const text = `
        SELECT * FROM questions
        WHERE id = $1;
    `;
  try {
    const { rows: question } = await pool.query(text, [questionId]);
    res.send(question);
  } catch (err) {
    next(err);
  }
};

export const getReponses = async (req, res, next) => {
  const { id: questionId } = req.params;

  const text = `
        WITH responses AS (
            SELECT * FROM responses
            WHERE question_id = $1
        ) SELECT email, name, response, r.id, r.created_at FROM account a
            JOIN responses r
            ON r.user_id = a.id
            ORDER BY r.created_at;

    `;
  try {
    const { rows: responses } = await pool.query(text, [questionId]);
    res.send(responses);
  } catch (err) {
    next(err);
  }
};
