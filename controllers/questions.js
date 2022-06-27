import { query } from "express";
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

export const createResponse = async (req, res, next) => {
  const { id: questionId } = req.params;
  const { response } = req.body;

  const text = `INSERT INTO responses (user_id, question_id, response) 
    VALUES ($1, $2, $3)
    RETURNING id;`;

  try {
    const { rows } = await pool.query(text, [req.userId, questionId, response]);
    const { id: responseId } = rows[0];
    res.send(responseId);
  } catch (err) {
    next(err);
  }
};

export const getQuestions = async (req, res, next) => {
  const { moreQuestions } = req.query;

  const getMoreQuestions =
    moreQuestions > 0 ? `OFFSET ${+moreQuestions} LIMIT 5` : `LIMIT 5`;

  const text = `
  WITH more_questions AS (
    SELECT * FROM questions
    ORDER BY created_at DESC
    ${getMoreQuestions}
  ) SELECT a.id AS user_id, a.name, a.email, mq.id AS question_id, question, description, mq.created_at FROM more_questions mq 
  LEFT JOIN account a
    ON user_id = a.id
  ORDER BY mq.id DESC;`;

  try {
    const { rows: questions } = await pool.query(text);
    return res.send(questions);
  } catch (err) {
    return next(err);
  }
};

export const getHotQuestions = async (req, res, next) => {
  const text = `
  WITH most_liked_questions AS (
    SELECT question_id, SUM(like_dislike) AS total_likes FROM question_like_dislike 
    GROUP BY question_id
    ORDER BY SUM(like_dislike) DESC
    LIMIT 5
  ) SELECT a.id AS user_id, a.name, a.email, question_id, question, description, q.created_at FROM most_liked_questions mlq
  LEFT JOIN questions q
  ON q.id = mlq.question_id
  LEFT JOIN account a
  ON user_id = a.id
  ORDER BY total_likes DESC;`;

  try {
    const { rows } = await pool.query(text);
    res.send(rows);
  } catch (error) {
    return next(error);
  }
};

export const getQuestion = async (req, res, next) => {
  const { id: questionId } = req.params;

  const text = `
    WITH question AS (
      SELECT * FROM questions
      WHERE id = $1
    ) SELECT a.id AS user_id, a.name, a.email, mq.id AS question_id, question, description, mq.created_at FROM question mq
    LEFT JOIN account a
    ON user_id = a.id;
      `;
  try {
    const { rows: question } = await pool.query(text, [questionId]);
    if (question.length === 0) {
      const error = new Error(`Question with id ${questionId} don't exist`);
      error.statusCode = 400;
      return next(error);
    }
    res.send(question[0]);
  } catch (err) {
    if (err.code === "22P02") {
      return next();
    }
    next(err);
  }
};

export const getReponses = async (req, res, next) => {
  const { id: questionId } = req.params;

  const text = `
        WITH responses AS (
            SELECT * FROM responses
            WHERE question_id = $1
        ) SELECT email, name, response, r.id, r.created_at FROM responses r
            LEFT JOIN account a
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

export const getResponse = async (req, res, next) => {
  const { id: questionId, responseId } = req.params;

  const text = `
  WITH responses AS (
    SELECT * FROM responses
    WHERE question_id = $1 AND id = $2
) SELECT email, name, response, r.id, r.created_at FROM responses r
    LEFT JOIN account a
    ON r.user_id = a.id
  `;
  try {
    const { rows: response } = await pool.query(text, [questionId, responseId]);
    res.send(response);
  } catch (err) {
    next(err);
  }
};

export const getTotalNumberOfQuestions = async (req, res, next) => {
  const text = `
    SELECT COUNT(id) FROM questions;`;

  try {
    const { rows } = await pool.query(text);
    const { count } = rows[0];
    res.send({ totalNumOfQuestions: +count });
  } catch (error) {
    next(err);
  }
};

export const getLikesAndDislikes = async (req, res, next) => {
  const { moreQuestions } = req.query;

  const getMoreQuestions =
    moreQuestions > 0 ? `OFFSET ${+moreQuestions} LIMIT 5` : `LIMIT 5`;

  const text = `
  WITH more_questions AS (
    SELECT id FROM questions
    ORDER BY created_at DESC
    ${getMoreQuestions}
  ) SELECT * FROM question_like_dislike
    WHERE question_id IN (SELECT id FROM more_questions);`;

  try {
    const { rows } = await pool.query(text);
    return res.send(rows);
  } catch (error) {
    return next(error);
  }
};

export const getHotQuestionsLikesAndDislikes = async (req, res, next) => {
  const text = `
  WITH most_liked_questions AS (
    SELECT question_id FROM question_like_dislike 
    GROUP BY question_id
    ORDER BY SUM(like_dislike) DESC
    LIMIT 5
  ) SELECT * FROM question_like_dislike
  WHERE question_id IN (SELECT question_id FROM most_liked_questions);
  `;

  try {
    const { rows } = await pool.query(text);
    res.send(rows);
  } catch (error) {
    return next(error);
  }
};

export const getResponsesLikesAndDislikes = async (req, res, next) => {
  const { id: questionId } = req.params;

  const text = `
    SELECT * from response_like_dislike
    WHERE question_id = $1`;

  try {
    const { rows } = await pool.query(text, [questionId]);
    return res.send(rows);
  } catch (error) {
    return next(error);
  }
};

export const getResponseLikesAndDislikes = async (req, res, next) => {
  const { id: questionId, responseId } = req.params;

  const text = `
    SELECT * from response_like_dislike
    WHERE question_id = $1 AND response_id = $2`;

  try {
    const { rows } = await pool.query(text, [questionId, responseId]);
    return res.send(rows);
  } catch (error) {
    return next(error);
  }
};

export const getLikesById = async (req, res, next) => {
  const { id } = req.params;

  const text = `
    SELECT * FROM question_like_dislike
    WHERE question_id = $1;`;

  try {
    const { rows } = await pool.query(text, [id]);
    res.send(rows);
  } catch (error) {
    return next(error);
  }
};

export const like = async (req, res, next) => {
  const { id } = req.params;

  const text = `INSERT INTO question_like_dislike (user_id, question_id, like_dislike) VALUES ($1, $2, $3)
  ON CONFLICT (user_id, question_id) DO UPDATE
  SET like_dislike = EXCLUDED.like_dislike;`;

  try {
    await pool.query(text, [req.userId, id, 1]);
    res.send();
  } catch (err) {
    next(err);
  }
};

export const deleteLike = async (req, res, next) => {
  const { id } = req.params;

  const text = `
    DELETE FROM question_like_dislike
    WHERE user_id = $1 AND question_id = $2
  `;

  try {
    await pool.query(text, [req.userId, id]);
    res.send();
  } catch (error) {
    return next(error);
  }
};

export const dislike = async (req, res, next) => {
  const { id } = req.params;

  const text = `INSERT INTO question_like_dislike (user_id, question_id, like_dislike) VALUES ($1, $2, $3)
  ON CONFLICT (user_id, question_id) DO UPDATE
  SET like_dislike = EXCLUDED.like_dislike;`;

  try {
    await pool.query(text, [req.userId, id, -1]);
    res.send();
  } catch (err) {
    next(err);
  }
};

export const deleteDislike = async (req, res, next) => {
  const { id } = req.params;

  const text = `
    DELETE FROM question_like_dislike
    WHERE user_id = $1 AND question_id = $2
  `;

  try {
    await pool.query(text, [req.userId, id]);
    res.send();
  } catch (error) {
    return next(error);
  }
};

export const responseLike = async (req, res, next) => {
  const { id: questionId, responseId } = req.params;

  const text = `INSERT INTO response_like_dislike (response_id, user_id, question_id, like_dislike) VALUES ($1, $2, $3, $4)
  ON CONFLICT (response_id, user_id, question_id) DO UPDATE
  SET like_dislike = EXCLUDED.like_dislike;`;

  try {
    await pool.query(text, [responseId, req.userId, questionId, 1]);
    res.send();
  } catch (err) {
    next(err);
  }
};

export const deleteResponseLike = async (req, res, next) => {
  const { id: questionId, responseId } = req.params;

  const text = `
    DELETE FROM response_like_dislike
    WHERE response_id = $1 AND user_id = $2 AND question_id = $3
  `;

  try {
    await pool.query(text, [responseId, req.userId, questionId]);
    res.send();
  } catch (error) {
    return next(error);
  }
};

export const responseDislike = async (req, res, next) => {
  const { id: questionId, responseId } = req.params;

  const text = `INSERT INTO response_like_dislike (response_id, user_id, question_id, like_dislike) VALUES ($1, $2, $3, $4)
  ON CONFLICT (response_id, user_id, question_id) DO UPDATE
  SET like_dislike = EXCLUDED.like_dislike;`;

  try {
    await pool.query(text, [responseId, req.userId, questionId, -1]);
    res.send();
  } catch (err) {
    next(err);
  }
};

export const deleteResponseDislike = async (req, res, next) => {
  const { id: questionId, responseId } = req.params;

  const text = `
    DELETE FROM response_like_dislike
    WHERE response_id=$1 AND user_id = $2 AND question_id = $3
  `;

  try {
    await pool.query(text, [responseId, req.userId, questionId]);
    res.send();
  } catch (error) {
    return next(error);
  }
};
