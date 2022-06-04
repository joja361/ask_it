import pool from "../db.js";

export const createQuestion = async (req, res, next) => {
    const {post} = req.body; 

    const text = 'INSERT INTO questions (user_id, question) VALUES ($1, $2);'
    try {
        await pool.query(text, [req.userId, post])
        res.send()
    } catch(err) {
        next(err)
    }
}

export const likeQuestion = async (req, res, next) => {
    const {id: questionId} = req.params
    
    const text = 'INSERT INTO question_likes (user_id, question_id) VALUES ($1, $2);'
    try {
        await pool.query(text, [req.userId, questionId])
        res.send()
    } catch(err) {
        next(err)
    }
}

export const createResponse = async (req, res, next) => {
    const {id: questionId} = req.params
    const {response} = req.body
    
    console.log(questionId, response)

    const text = 'INSERT INTO responses (user_id, question_id, response) VALUES ($1, $2, $3);'
    try {
        await pool.query(text, [req.userId, questionId, response ])
        res.send()
    } catch(err) {
        next(err)
    }
}

export const getQuestions = async (req, res, next) => {
    const {last, mostLiked} = req.query

    if(last) {
        const text = "SELECT a.name, q.question, q.created_at AS created FROM questions q LEFT JOIN account a ON q.user_id = a.id ORDER BY created DESC LIMIT $1"
        try {
            const {rows: questions} = await pool.query(text, [last])
            return res.send(questions)
        } catch(err) {
            return next(err)
        }
    }
    
    if(mostLiked === 'true') {
        const text = 
        `WITH top_5_questions AS (
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
        ;`
        try {
            const {rows: top5Questions} = await pool.query(text)
            return res.send(top5Questions)
        } catch(err) {
            return next(err)
        }
    }
    //CHECK ABOUT THIS OPTIONAL QUERIES IS IT GOOD PRACTICE AND ERROR HANDELING FOR THIS CASES
    const error = new Error('You enter something wrong in URL')
    error.statusCode = 400
    next(error)
}   

export const getQuestion = async (req, res, next) => {
    const {id: questionId } = req.params

    const text = `
        SELECT * FROM questions
        WHERE user_id = $1 AND id = $2;
    `
    try {
        const {rows: question} = await pool.query(text, [req.userId, questionId])
        res.send(question)
    } catch(err) {
        next(err)
    }
}

export const getReponses = async (req, res, next) => {
    const {id: questionId} = req.params

    const text = `
        WITH responses AS (
            SELECT * FROM responses
            WHERE question_id = $1
        ) SELECT email, name, response, r.created_at FROM account a
            JOIN responses r
            ON r.user_id = a.id;
    `
    try {
        const {rows: responses} = await pool.query(text, [questionId])
        res.send(responses)
    } catch(err) {
        next(err)
    }
}

export const getMyQuestions = async (req, res, next) => {
    const {userId} = req.params
    const {last} = req.query
    
    const text = 
        `SELECT * FROM questions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2;`
    try {
        const {rows: myQuestions} = await pool.query(text, [userId, last])
        res.send(myQuestions)
    } catch(err) {
        next(err)
    }
}