const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const configPhieucham = new Schema({
    phieukhaosat: [{
        cauhoi: String,
        thutu: Number,
        options: [
            {
                text: String,
                thutu: Number,
                choice: Boolean
            }
        ]
    }],
    name: String,
    user_created: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }
}, { timestamps: true });

const Phieukhaosat = mongoose.model('Phieukhaosat', configPhieucham);

module.exports = Phieukhaosat;