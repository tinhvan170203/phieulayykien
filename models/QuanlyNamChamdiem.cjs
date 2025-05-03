const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const quantrichamdiemSchema = new Schema({
    user_created:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
    nam: {
        type: Number,
        // unique: true
    },
    title: {
        type:String
    },
    setting: [{
        khoi: {
             type: mongoose.Schema.Types.ObjectId,
            ref: "Khois"
        },
        phieukhaosat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Phieukhaosat"
        }
    }],
    thoigianbatdautucham: Date, // để so sánh với thời gian khóa tài khoản không sử dụng
    // ketthuctuchamdiem: Boolean, // trạng thái fales là sẽ tự động khóa tự chấm
    // ketthucthoigiangiaitrinh: Boolean,
    // thoigianhethantuchamdiem: Date,
    // thoigianhethangiaitrinh: Date,
    // thoigianhethanthamdinhlan1: Date,
    // thoigianhethanthamdinhlan2: Date,
    // diemthuongtoida: Number,
    // diemphattoida: Number,
    status: Boolean //
}, { timestamps: true });


const QuantriNamChamdiem = mongoose.model('QuantriNamChamdiem', quantrichamdiemSchema);

module.exports = QuantriNamChamdiem;