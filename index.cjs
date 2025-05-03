const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
var cookies = require("cookie-parser");
var bodyParser = require('body-parser');
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
// console.log(numCPUs)
const docx = require('docx');
const fs = require("fs");
    const app = express();
    app.use(cookies());
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    
    app.use(cors({
        // origin: "*",
        origin: ["http://localhost:5173", "http://localhost:400", "https://phieulayykien.cahy.vercel.app"],
        credentials: true,
    }));
    // app.use(express.json());
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
    const port = process.env.port || 4000;
    
    
    const caicachhanhchinhRoute = require('./routes/caicachhanhchinh.cjs');
    const authRoute = require('./routes/auth.cjs');
    const caicachRoute = require('./routes/updatecaicach.cjs');
    const khoiRoute = require('./routes/khoi.cjs');
    
    app.use('/auth', authRoute);
    app.use('/cham-diem', caicachhanhchinhRoute);
    app.use('/cchc', caicachRoute);
    app.use('/khoi', khoiRoute);
    
    const path = require("path");
    const basePath = '';
    
    app.use(express.static(path.join(__dirname, '/upload')));
    app.use(express.static('upload'));
    app.use(express.static('public'));
    
    //cấu hình chạy reactjs trên node server
    app.use(basePath + "/", express.static(path.resolve(__dirname + "/dist")));
    
    app.get("*", (request, response) => {
      response.sendFile(path.resolve(__dirname + "/dist/index.html"));
    });
    
   
    
    app.listen(port, () => {
        console.log('server running ', port)
    });
    
    mongoose.set('strictQuery', true);
    mongoose.connect("mongodb+srv://vuvantinh121123:cKo6IkBIbE895guO@cluster0.sqjsyhf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err) => {
        if (err) {
            console.log(err)
        }
        console.log('kết nối db thành công')
    })

