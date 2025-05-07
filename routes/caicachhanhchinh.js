const express = require('express');
const router = express.Router();
const checkRole = require('../middlewares/checkRole');
const middlewareController = require('../middlewares/verifyToken');

const caicachhanhchinh = require('../controllers/caicachhanhchinh');
const path = require('path')
const multer = require('multer')

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let id_user = req.userId.userId
        cb(null, path.join(__dirname,`../upload/${id_user}`))
    },
    filename: function(req, file, cb) {
        const originalName = file.originalname; // tên file gốc
        const encodedName = Buffer.from(originalName, 'latin1').toString('utf8'); // mã hóa tên file
        // cb(null, encodedName); // dùng tên file đã mã hóa
        cb(null, + new Date() + '_' + encodedName)
    }
});


var upload = multer({
    storage: storage,
});




router.get('/download/:file',middlewareController.verifyToken, caicachhanhchinh.downloadFile)
router.post('/:id/chot-diem-tu-cham',middlewareController.verifyToken, upload.array('files'),  caicachhanhchinh.saveChotdiemtucham);

//fetch tài khoản địa phương
router.get('/bang-diem-tham-dinh/fetch', middlewareController.verifyToken, caicachhanhchinh.fetchBangchamthamdinh);


router.get('/change/status/chot-so', middlewareController.verifyToken, checkRole(), caicachhanhchinh.changeStatusChotdiem)

router.get('/thoi-han-cham/fetch',middlewareController.verifyToken,   caicachhanhchinh.getQuantrichamdiems);
router.post('/thoi-han-cham/add', middlewareController.verifyToken, checkRole(), caicachhanhchinh.addQuantrichamdiem);
router.put('/thoi-han-cham/edit/:id',middlewareController.verifyToken, checkRole(),  caicachhanhchinh.updateQuantrichamdiem);
router.delete('/thoi-han-cham/delete/:id',middlewareController.verifyToken, checkRole(),  caicachhanhchinh.deleteQuantrichamdiem);
router.delete('/xoa-phieu-cham/delete/:id',middlewareController.verifyToken,   caicachhanhchinh.resetPhieuchamdiem);

router.get('/fetch/system-history', middlewareController.verifyToken, caicachhanhchinh.fetchLichsuHethong)

module.exports = router