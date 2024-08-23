const express = require('express');
const posts = require('../Controllers/postController');

const router = express.Router()

router.get('/', posts.get_posts)
router.get('/:id', posts.get_single_post)
router.get('/user/:id', posts.get_user_posts)
router.get('/user/likes/:id', posts.fetch_likes)
router.post('/create', posts.create_post)
router.put('/:id/update', posts.update_posts)
router.put('/:id/like', posts.like_post)
router.put('/:id/deleteimg', posts.remove_img)
router.delete('/:id/delete', posts.delete_posts)

module.exports = router;