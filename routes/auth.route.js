const {Router} = require("express")
const {check, validationResult} = require("express-validator")
const router = Router()
const authController = require("../controllers/auth.controller")



router.post(
    '/admin/signUp',
    [
        check('username', 'Incorrect username').notEmpty(),
        check('password', 'Incorrect password').notEmpty().isLength({min:6,max:15})
    ],
    authController.signUp
)

router.post(
    '/admin/logIn',
    [
      check('username', 'Incorrect username').notEmpty(),
      check('password', 'Incorrect password').notEmpty().isLength({min:6,max:15})
    ],
    authController.logIn
)

router.post(
    '/admin/logout',

    authController.logout
)

router.post(
    '/admin/refresh',

    authController.refresh
)

module.exports = router