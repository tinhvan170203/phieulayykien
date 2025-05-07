const express = require('express');

const router = express.Router();
const checkRole = require('../middlewares/checkRole.cjs');
const middlewareController = require('../middlewares/verifyToken.cjs');
const khoi = require('../controllers/khoi.cjs');

router.get('/fetch', khoi.getKhois);
router.get('/fetch-user-cap2', khoi.getKhoisUserCap2);
// router.get('/fetch',middlewareController.verifyToken,  khoi.getKhois);
router.get('/fetch-active',middlewareController.verifyToken,  khoi.fetchKhoiActive);
router.post('/add',middlewareController.verifyToken, khoi.addKhoi);
router.put('/edit/:id',middlewareController.verifyToken, khoi.updateKhoi);
router.delete('/delete/:id',middlewareController.verifyToken, khoi.deleteKhoi);


module.exports = router