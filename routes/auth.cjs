const express = require('express');

const router = express.Router();

const auth = require('../controllers/auth.cjs');
const middlewareController = require('../middlewares/verifyToken.cjs');
const checkRole = require('../middlewares/checkRole.cjs');
// const middlewareController = require('../middlewares/verifyToken');

router.post('/login', auth.login )
router.post('/change-pass', auth.changePassword )
router.get('/logout',  auth.logout)
router.get('/requestRefreshToken', auth.requestRefreshToken)
router.get('/user/fetch-accounts-theo-khoi', middlewareController.verifyToken, auth.fetchAccountsTheoKhoi)
//route tạo tài khoản cấp bộ, cục, tỉnh
router.get('/user/fetch',middlewareController.verifyToken, auth.getUserList)
router.post('/user/add', middlewareController.verifyToken, auth.addUser)
router.post('/user/change-many-status', middlewareController.verifyToken, auth.changeStatusAccounts)
router.delete('/user/delete/:id',middlewareController.verifyToken, auth.deleteUser)
router.put('/user/edit/:id', middlewareController.verifyToken,  auth.editUser)


//route tạo tài khoản cấp phòng, xã của công an cấp tỉnh
router.get('/user/cap-tinh/fetch',middlewareController.verifyToken, auth.getUserListOfCapTinh)
router.post('/user/cap-tinh/change-many-status', middlewareController.verifyToken, auth.changeStatusAccountsOfCapTinh)

router.get('/user/list/cap-tinh/fetch',middlewareController.verifyToken, auth.getUserCapTinh)

//lấy ra user cấp con của 1 user
router.get('/user/children',middlewareController.verifyToken, auth.fetchChildrenUser)
module.exports = router