const express = require('express')
const router = express.Router()
const PostComment = require('../models/postComment')
const helper = require('./helper')
const User = require('../models/user')
const Post = require('../models/post')

router.use(helper) //Need to figure this out

//CREATE
router.post('/', (request, response) => {
    const body = request.body

    if (body.commentBody === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }


    let post = Post.findById(body.post)
    .then(p => p._id)
    .catch(error => {
        console.log('There was an Error with the postID\n')
        throw new Error(error)
    })

    let user = User.findById(body.user)
    .then(u => u._id)
    .catch(error => {
        console.log('There was an Error with the userID\n')
        throw new Error(error)
    })

    let parentComment = PostComment.findById(body.parentComment)
    .then(pc => pc._id)
    .catch(error => {
        if (body.parentComment == null) { //This is if there is no parent comment
            return null
        }
        else {
            console.log('There was an Error with the parentID\n')
            throw new Error(error)
        }
    })


    const postComment = Promise.all([user, post, parentComment]).then((values) => {
        userID = values[0]
        postID = values[1]
        parentCommentID = values[2]

        return new PostComment({
            commentBody: body.commentBody,
            commentUpvote: 0,
            commentDownvote: 0,
            date: new Date(),
            user: userID,
            post: postID,
            parentComment: parentCommentID,
            childrenComments: []
        })
    }).then((postComment) => {
        postComment.save().then(savedPostComment => {
            //Update reference in User
            User.findByIdAndUpdate(userID, {'$push': {'postComments': savedPostComment._id}}, 
                (error, success) => console.log(error || success))

            //Update reference in Thread
            Post.findByIdAndUpdate(postID, {'$push': {'postComments': savedPostComment._id}}, 
                (error, success) => console.log(error || success))

            //Update reference in Parent Comment
            PostComment.findByIdAndUpdate(parentCommentID, {'$push': {'childrenComments': savedPostComment._id}}, 
                (error, success) => console.log(error || success))

            response.json(savedPostComment)
        })
    }).catch((error) => {
        console.log(error)
        response.status(400).send({ error: 'There was an Error' })
        response.end()
    })
     
})

//READ
router.get('/:id', (request, response, next) => {
    PostComment.findById(request.params.id)
        .then(postComment => {
            if (postComment) {
                response.json(postComment)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

//UPDATE
router.put('/:id', (request, response, next) => {
    const body = request.body

    const postComment = {
        commentBody: body.commentBody,
        commentUpvote: body.commentUpvote,
        commentDownvote: body.commentDownvote,
    }

    PostComment.findByIdAndUpdate(request.params.id, postComment, { new: true })
        .then(updatedPostComment => {
            response.json(updatedPostComment)
        })
        .catch(error => next(error))
})

//DESTROY
router.delete('/:id', (request, response, next) => {
    //Delete references from parents
    PostComment.findById(request.params.id).then((pc) => {
        let postComment = pc

        let user = User.findById(postComment.user)
        .then(u => u._id)
        .catch(error => {
            console.log('There was an Error with the userID\n')
            throw new Error(error)
        })

        let post = Post.findById(postComment.post)
        .then(p => p._id)
        .catch(error => {
            console.log('There was an Error with the postID\n')
            throw new Error(error)
        })

        let parentComment = PostComment.findById(postComment.parentComment)
        .then(pc => {
            if (pc == null) {
                return null
            } else {
                return pc._id
            }
        })
        .catch(error => {
            console.log('There was an Error with the parentID\n')
            throw new Error(error)
        })

        //Remove reference of current comment from post and user
        const removeParent = Promise.all([user, post, parentComment]).then((values) => {
            user = values[0]
            post = values[1]
            parent = values[2]

            // console.log(post)
            // console.log(parent)

            User.findByIdAndUpdate(user, {'$pull': {'postComments': postComment._id}}, 
                (error, success) => console.log(error || success))
            Post.findByIdAndUpdate(post, {'$pull': {'postComments': postComment._id}}, 
                (error, success) => console.log(error || success))
            PostComment.findByIdAndUpdate(parent, {'$pull': {'childrenComments': postComment._id}}, 
                (error, success) => console.log(error || success))
            
        }).catch((error) => {
            console.log(error)
            response.status(400).send({ error: 'There was an Error' })
            response.end()
        })

    }).then(() => {
        //Deleting the comment
        PostComment.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
    }).catch((error) => {
        console.log(error)
        response.status(400).send({ error: 'There was an Error' })
        response.end()
    })

})

module.exports = router;