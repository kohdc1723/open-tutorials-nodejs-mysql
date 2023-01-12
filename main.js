const http = require("http");
const url = require("url");
const topic = require("./lib/topic");
const author = require("./lib/author");

const app = http.createServer((req, res) => {
    let _url = req.url;
    let queryData = url.parse(_url, true).query;
    let pathName = url.parse(_url, true).pathname;

    switch (pathName) {
        case "/":
            if (queryData.id === undefined) {
                topic.home(req, res);
            } else {
                topic.page(req, res);
            }
            break;

        case "/create":
            topic.create(req, res);
            break;

        case "/create_process":
            topic.createProcess(req, res);
            break;

        case "/update":
            topic.update(req, res);
            break;

        case "/update_process":
            topic.updateProcess(req, res);
            break;

        case "/delete_process":
            topic.deleteProcess(req, res);
            break;

        case "/author":
            author.home(req, res);
            break;

        case "/author/create":
            author.create(req, res);
            break;

        case "/author/create_process":
            author.createProcess(req, res);
            break;

        case "/author/update":
            author.update(req, res);
            break;

        case "/author/update_process":
            author.updateProcess(req, res);
            break;

        case "/author/delete_process":
            author.deleteProcess(req, res);
            break;

        default:
            topic.error(req, res);
            break;
    }
});

app.listen(3000);