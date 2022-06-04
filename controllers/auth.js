import bcrypt from 'bcrypt'
import { config } from 'dotenv'
import { validationResult } from "express-validator"
import jwt from 'jsonwebtoken'
import pool from "../db.js"
import {body} from 'express-validator'

config()

export const signup = async (req, res, next) => {
    const {email, password, name} = req.body
    
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422 // 422 Unprocessable Entity
        error.data = errors.array()
        return next(error)
    }

    const bcryptPassword = await bcrypt.hash(password, 12)

    const text = `INSERT INTO account (email, password, name) VALUES ($1, $2, $3);`
    try {
        await pool.query(text, [email, bcryptPassword, name])
        res.send()
    } catch(err) {
        if(err.code === '23505') {
            const error = new Error('This email is already taken, please try with another.')
            error.statusCode = 422 // 422 Unprocessable Entity
            return next(error)
        }
        return next(err)
    }
}

export const login = async (req, res, next) => {
    const {email, password} = req.body

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422
        error.data = errors.array()
        return next(error)
    }

    let user
    const text = 'SELECT id, email, password FROM account WHERE email=$1'
    try {
        const {rows: users} = await pool.query(text, [email])
        const [userFromData, ...rest] = users
        if(!userFromData) {
            const error = new Error('You are not registred.')
            error.statusCode = 401 // 401 Unauthorized
            return next(error)
        }
        user = userFromData
    } catch(err) {
        next(err)
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if(!passwordMatch) {
        const error = new Error('You entered incorrect password, please try again.')
        error.statusCode = 401
        return next(error)
    }

    const token = jwt.sign({email, password, userId: user.id}, process.env.SECRET)
    res.send({userId: user.id, token})    
}

export const resetPassword = async (req, res, next) => {
    const {id, oldPassword, newPassword} = req.body

    if(oldPassword === newPassword) {
        const error = new Error('You entered same password as old one.')
        error.statusCode = 422 // 422 Unprocesseble entity
        return next(error)
    }

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed')
        error.statusCode = 422
        error.data = errors.array()
        return next(error)
    }

    let user 
    const searchingUser = 'SELECT password FROM account WHERE id=$1'
    try {
        const {rows: users} = await pool.query(searchingUser, [id])
        const [userFromData, ...rest] = users
        if(!userFromData) {
            const error = new Error('You are not registred.')
            error.statusCode = 401 // 401 Unauthorized
            return next(error)
        }
        user = userFromData
    } catch(err) {
        next(err)
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password)
    if(!passwordMatch) {
        const error = new Error('You entered incorrect old password, please try again.')
        error.statusCode = 401 // 401 Unauthorized
        return next(error)
    }

    const bcryptPassword = await bcrypt.hash(newPassword, 12)
    const updatingUserPassword = 'UPDATE account SET password=$1 WHERE id=$2'
    try {
        await pool.query(updatingUserPassword, [bcryptPassword, id])
        res.send()
    } catch(err) {
        next(err)
    }
}


