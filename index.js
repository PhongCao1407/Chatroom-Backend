require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

//Middlewares
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

// this has to be the last loaded middleware.
// app.use(errorHandler) 

const userRoute = require('./routes/userRoute')
app.use('/api/users', userRoute)

const threadRoute = require('./routes/threadRoute')
app.use('/api/threads', threadRoute)

const postRoute = require('./routes/postRoute')
app.use('/api/posts', postRoute)

const postCommentRoute = require('./routes/postCommentRoute')
app.use('/api/postcomments', postCommentRoute)

const loginRoute = require('./routes/loginRoute')
app.use('/api/login', loginRoute)

// Deploy app to Port 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})