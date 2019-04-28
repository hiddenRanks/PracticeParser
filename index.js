//module 불러오기
const express = require('express');
const http = require('http');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');

let app = express();

app.set('port', 12000);
app.set('views', path.join(__dirname), "views");
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json()); //request body에 오는 데이터를 json으로 변환
app.use(bodyParser.urlencoded({extended:true})); //객체 안에 무언가를 인코딩 해야 된다면 true

app.all('/', function(req, res) {
    res.render('main', {msg: 'welcome'});
});

let server = http.createServer(app);
server.listen(app.get('port'), function() {
    console.log(`Express 엔진이 ${app.get('port')}에서 실행중`);
});