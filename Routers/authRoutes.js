const register = require('../Controllers/registerController');
const login = require('../Controllers/loginController');
const express = require('express')

const router = express.Router();

router.post('/register', register.post_register);
router.delete('/:id/deleteaccount', register.post_delete);
router.put('/:id/updateaccount', register.update_acc);
router.put('/:id/updatepassword', register.update_password);
router.put('/:id/follow', register.add_follower);
router.get('/:id/followers', register.fetch_followers);
router.get('/getusers', register.get_users);
router.get('/:id/singleuser', register.get_user);
router.post('/login', login.post_login);
router.post('/logout', login.post_logout);

module.exports = router;