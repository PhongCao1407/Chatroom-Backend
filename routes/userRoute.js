const express = require('express')
const app = express()
const router = express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const PostComment = require('../models/postComment')
const helper = require('./helper')

router.use(helper)

//CREATE
router.post('/', (request, response) => {
    const body = request.body

    if (body.username === undefined || body.email === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    const user = new User({
        username: body.username,
        email: body.email,
        date: new Date(),
        posts: [],
    })

    user.save().then(savedUser => {
        response.json(savedUser)
    })
})

//READ

//Example request: http://localhost:3001/api/users/<id>
router.get('/:id', (request, response, next) => {
    console.log(request.params)

    User.findById(request.params.id)
        .then(user => {
            if (user) {
                response.json(user)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

// UPDATE
router.put('/:id', (request, response, next) => {
    console.log('put')
    const body = request.body

    const user = {
        username: body.username,
        email: body.email,
        posts: body.posts
    }

    User.findByIdAndUpdate(request.params.id, user, { new: true })
        .then(updatedUser => {
            response.json(updatedUser)
        })
        .catch(error => next(error))
})

//DESTROY
router.delete('/:id', (request, response, next) => {
    console.log('delete')
    //Delete associated Post
    Post.deleteMany({user: request.params.id})

    //Delete associated Post Comment 
    PostComment.deleteMany({user: request.params.id})

    //Delete the User
    User.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

module.exports = router;