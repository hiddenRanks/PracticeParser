//module 불러오기
const express = require('express');
const http = require('http');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const qs = require('querystring');
const mysql = require('mysql');

/* MySQL 연결 */
const conn = mysql.createConnection({
    user: "yy_30220",
    password: "1234",
    host: "gondr.asuscomm.com"
});

conn.query("USE yy_30220");
/* MySQL 연결 종료 */

let app = express();

app.set('port', 12000);
app.set('views', path.join(__dirname + '/views'), "views");
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json()); //request body에 오는 데이터를 json으로 변환
app.use(bodyParser.urlencoded({extended:true})); //객체 안에 무언가를 인코딩 해야 된다면 true

app.all('/', function(req, res) {
    res.render('main', {});
});

app.get('/soulworker', function(req, res) {
    request("https://soulworker.game.onstove.com/", function(err, response, body){ //res가 아닌 response로 한 이유는 위에 res랑 겹쳐서임
        let NoticeList = [];
        $ = cheerio.load(body);

        let notice = $(".sectionNews .ellipsis");
        for(let i = 0; i < notice.length; i++) {
            let data = $(notice[i]).text();
            NoticeList.push(data);
        }

        res.render('soulworker', {msg:'소울워커 공지사항', list:NoticeList});
    });
});

app.get('/manamoa', function(req, res) {
    res.render('manamoa', {list:searchList = undefined})
});

app.post('/manamoa', function(req, res) {
    var word = req.body.word;
    word = qs.escape(word);
    let url = "https://manamoa3.net/bbs/search.php?url=https%3A%2F%2Fmanamoa3.net%2Fbbs%2Fsearch.php&stx=" + word;
    request(url, function(err, response, body) {
        let searchList = [];
        $ = cheerio.load(body);

        let result = $(".post-content .manga-subject");
        for(let i = 0; i < result.length; i++) {
            let data = $(result[i]).text();
            searchList.push(data);
        }

        res.render('manamoa', {msg:'제목 검색 결과', list:searchList});
    });
});

app.get('/manamoaLike', function(req, res) {
    res.render('manamoaLike', {});
});

app.post('/manamoaLike', function(req, res) {
    var word = req.body.word;
    word = qs.escape(word);
    let url = "https://manamoa3.net/bbs/page.php?hid=manga_detail&manga_name=" + word;
    request(url, function(err, response, body) {
        $ = cheerio.load(body);

        let result = $(".slot span > .fa-thumbs-up > span");
        if(result != null) {
            let searchList = [];

            for(let i = 0; i < result.length; i++) {
                let data = $(result[i]).text();
                searchList.push(data);
            }
            
            let sql = "INSERT INTO manga (title, mangaLike) VALUES(?, ?)";
            for(let i = 0; i < searchList.length; i++) {
                conn.query(sql, [req.body.word, searchList[i]], function(err, result) {});
            }
            res.render('manamoaLike', {msg:'만화 좋아요 결과', list:searchList});
        }
    });
});

let server = http.createServer(app);
server.listen(app.get('port'), function() {
    console.log(`Express 엔진이 ${app.get('port')}에서 실행중`);
});