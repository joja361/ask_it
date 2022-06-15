import pool from "../db.js";

export const isMyQuestion = (req, res, next) => {
  const { tab } = req.query;
  if (tab !== "myQuestions") {
    return next();
  }
  next();
};

export const getMyQuestions = async (req, res, next) => {
  const { moreQuestions } = req.query;

  console.log(moreQuestions);

  const getMoreQuestions =
    moreQuestions > 0 ? `OFFSET ${+moreQuestions} LIMIT 5` : `LIMIT 5`;
  console.log(getMoreQuestions);

  const text = `SELECT * FROM questions
          WHERE user_id = $1
          ORDER BY created_at DESC
          ${getMoreQuestions};`;

  try {
    const { rows: myQuestions } = await pool.query(text, [req.userId]);
    console.log(myQuestions);
    res.send(myQuestions);
  } catch (err) {
    next(err);
  }
};

export const getTotalNumberOfMyQuestions = async (req, res, next) => {
  const text = `
    SELECT COUNT(*) FROM questions
    WHERE user_id = $1`;
  try {
    const { rows } = await pool.query(text, [req.userId]);
    const { count } = rows[0];
    res.send({ totalNumOfMyQuestions: +count });
  } catch (error) {
    next(err);
  }
};
