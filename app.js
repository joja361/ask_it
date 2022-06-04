import express from "express"
import routes from './routes/index.js'

const app = express()

app.use(express.json())

// ROUTES ARE HERE IN ONE PLACE
app.use('/', routes)


// ERROR 
app.use((error, req, res, next) => {
    const {message, data} = error
    const status = error.statusCode || 500

    res.status(status).json({
        message, 
        data
    })
})


app.listen(3000, () => {
    console.log('server running on port 3000')
})
