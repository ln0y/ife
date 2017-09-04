const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // 解决mongoose Promise兼容问题
// 连接并创建数据库
let dbURL = 'mongodb://localhost/ife';
mongoose.connect(dbURL, {
    useMongoClient: true,
});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('mongoose connected!');
});

// Define schema
let resultSchema = new mongoose.Schema({
    code: Number,
    msg: String,
    word: String,
    device: String,
    time: Number,
    dataList: [{
        info: String,
        link: String,
        pic: [String],
        title: String
    }]
});

// Creating a model(collection)
// 相当于创建数据表
module.exports = mongoose.model('crawlerBaidu', resultSchema);