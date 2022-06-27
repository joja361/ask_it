import pool from "../db.js";

export const getMyQuestions = async (req, res, next) => {
  const { moreQuestions } = req.query;

  const getMoreQuestions =
    moreQuestions > 0 ? `OFFSET ${+moreQuestions} LIMIT 5` : `LIMIT 5`;

  const text = `
          WITH more_questions AS (
            SELECT * FROM questions
            WHERE user_id = $1
            ORDER BY created_at DESC
            ${getMoreQuestions}
          ) SELECT a.id AS user_id, a.name, a.email, mq.id AS question_id, question, description, mq.created_at FROM more_questions mq 
          LEFT JOIN account a
            ON user_id = a.id
          ORDER BY mq.id DESC;
          `;

  try {
    const { rows: myQuestions } = await pool.query(text, [req.userId]);
    res.send(myQuestions);
  } catch (err) {
    next(err);
  }
};

export const getMyLikesAndDislikes = async (req, res, next) => {
  const { moreQuestions } = req.query;

  const getMoreQuestions =
    moreQuestions > 0 ? `OFFSET ${+moreQuestions} LIMIT 5` : `LIMIT 5`;

  const text = `
  WITH more_questions AS (
    SELECT id FROM questions
    WHERE user_id = $1
    ORDER BY created_at DESC
    ${getMoreQuestions}
  ) SELECT * FROM question_like_dislike
    WHERE question_id IN (SELECT id FROM more_questions);`;

  try {
    const { rows } = await pool.query(text, [req.userId]);
    return res.send(rows);
  } catch (error) {
    return next(error);
  }
};

export const getTotalNumberOfMyQuestions = async (req, res, next) => {
  const text = `
    SELECT COUNT(id) FROM questions
    WHERE user_id = $1`;
  try {
    const { rows } = await pool.query(text, [req.userId]);
    const { count } = rows[0];
    res.send({ totalNumOfMyQuestions: +count });
  } catch (error) {
    next(err);
  }
};

export const getUsersWithMostResponses = async (req, res, next) => {
  const text = `
  WITH users_with_most_responses AS (
    SELECT user_id, COUNT(user_id) AS total_responses FROM responses
    GROUP BY user_id
    ORDER BY COUNT(user_id) DESC
    LIMIT 3
  ) SELECT user_id, a.name, a.email, total_responses from users_with_most_responses
  LEFT JOIN account a
  ON user_id = a.id
  ORDER BY total_responses DESC;`;

  try {
    const { rows } = await pool.query(text);
    res.send(rows);
  } catch (error) {
    return next(error);
  }
};

export const getUser = async (req, res, next) => {
  const { userId } = req.params;

  const text = `
  WITH total_questions AS(
    SELECT user_id, COUNT(user_id) AS total_questions FROM questions
    WHERE user_id = $1
    GROUP BY user_id
  ), total_responses AS (	
    SELECT user_id, COUNT(user_id) AS total_responses FROM responses
    WHERE user_id = $1
    GROUP BY user_id
  ), total_question_likes AS (
    SELECT user_id, COUNT(user_id) AS total_question_likes FROM question_like_dislike
    WHERE user_id = $1	
    GROUP BY user_id
  ), total_response_likes AS (
    SELECT user_id, COUNT(user_id) AS total_response_likes FROM response_like_dislike 
    WHERE user_id = $1
    GROUP BY user_id
  ) SELECT id, name, email, created_at, total_questions, total_responses, total_question_likes, total_response_likes FROM account
  LEFT JOIN total_questions tq
  ON tq.user_id = id
  LEFT JOIN total_responses tr
  ON tr.user_id = id
  LEFT JOIN total_question_likes tql
  ON tql.user_id = id
  LEFT JOIN total_response_likes trl
  ON trl.user_id = id
  WHERE id = $1; 
  `;

  try {
    const { rows: userDetails } = await pool.query(text, [userId]);
    res.send(userDetails);
  } catch (error) {
    return next(error);
  }
};

export const getUsersHotQuestions = async (req, res, next) => {
  const { userId } = req.params;

  const text = `
  WITH user_questions AS(
    SELECT id, question FROM questions
    WHERE user_id = $1
  ), user_question_likes AS(
    SELECT question_id, SUM(like_dislike) AS total_likes FROM question_like_dislike
    WHERE question_id IN (SELECT id from user_questions)
    GROUP BY question_id
    ORDER BY SUM(like_dislike) DESC
    LIMIT 3
  ) SElECT id, question FROM user_question_likes
  LEFT JOIN user_questions
  ON id = question_id;`;

  try {
    const { rows } = await pool.query(text, [userId]);
    res.send(rows);
  } catch (error) {
    return next(error);
  }
};
