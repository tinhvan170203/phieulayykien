const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const khoiSchema = new Schema({
    tenkhoi: String,
    thutu: Number,
    status: Boolean,
    user_created: {
        type: mongoose.Schema.Types.ObjectId,
                    ref: "Users"
    }
},{timestamps: true});

const Khois = mongoose.model('Khois', khoiSchema);

module.exports = Khois;