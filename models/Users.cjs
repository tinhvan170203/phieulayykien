const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    tentaikhoan: {
        type: String,
        unique: true,
        required: true
    },
    role: String, // Admin, User
    matkhau: String,
    tenhienthi: String,
    status: Boolean,
    captaikhoan: String, // Quản trị V03, Quản trị Công an cấp tỉnh,
    // Cơ quan, đầu mối lấy ý kiến
    capcha: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    khoi: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Khois"
    },
    time_block: Date,
    block_by_admin:Boolean,
    thutu: Number,
});

const Users = mongoose.model('Users', userSchema);

module.exports = Users;