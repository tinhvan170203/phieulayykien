const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const phieuchamdiemSchema = new Schema({
    year: Number,
    hoanthanhkhaosat: {
        status: Boolean,
        files:[String],
        time: {
            type: Date
        }
    }, //quanr tri he thong moi co quyen chinh sua
    taikhoan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    phieukhaosat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Phieukhaosat"
    },
    phieukhaosat_detail: [],
    taikhoan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    khoichucnang: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Khois"
    },
}, { timestamps: true });

const Phieuchamdiems = mongoose.model('Phieuchamdiems', phieuchamdiemSchema);

module.exports = Phieuchamdiems;