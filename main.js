const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const template = require("./lib/template");
const mysql = require("mysql");
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1723",
    database: "open-tutorials"
});
db.connect();

const app = http.createServer((req, res) => {
    let _url = req.url;
    let queryData = url.parse(_url, true).query;
    let pathName = url.parse(_url, true).pathname;

    if (pathName === "/" && queryData.id === undefined) {
        db.query("SELECT * FROM topic", (error, result) => {
            // welcome page
            let title = "Welcome";
            let description = "Hello, Node.js!";
            let body = `
                <h2>${title}</h2>
                <article>${description}</article>
            `;
            let list = template.list(result);
            let control = `
                <a href="/create">Create</a>
            `;
            let html = template.html(title, list, control, body);

            res.writeHead(200);
            res.end(html);
        });
    } else if (pathName === "/" && queryData.id !== undefined) {
        // contents page
        db.query("SELECT * FROM topic", (error1, result1) => {
            if (error1) {
                throw error1;
            }

            db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], (error2, result2) => {
                if (error2) {
                    throw error2;
                }

                let title = result2[0].title;
                let description = result2[0].description;
                let body = `
                    <h2>${title}</h2>
                    <p>by ${result2[0].name}</p>
                    <article>${description}</article>
                `;
                let list = template.list(result1);
                let control = `
                    <a href="/update?id=${queryData.id}">Update</a>
                    <form action="/delete_process" method="post">
                        <input type="hidden" name="id" value="${queryData.id}">
                        <input type="submit" value="Delete" style="all: unset; text-decoration: underline; color: blue; cursor: pointer">
                    </form>
                `;
                let html = template.html(title, list, control, body);
    
                res.writeHead(200);
                res.end(html);
            });
        });
    } else if (pathName === "/create") {
        // create page
        db.query("SELECT * FROM topic", (error1, result1) => {
            db.query("SELECT * FROM author", (error2, result2) => {
                let title = "Create";
                let body = `
                    <h2>${title}</h2>
                    <article>
                        <form action="/create_process" method="post">
                            <p><input type="text" name="title" placeholder="title"></input></p>
                            <p><textarea name="description" placeholder="description"></textarea></p>
                            <p>${template.authorSelect(result2)}</p>
                            <p><input type="submit" value="create"></input></p>
                        </form>
                    </article>
                `;
                let list = template.list(result1);
                let control = `
                    <a href="/create">Create</a>
                `;
                let html = template.html(title, list, control, body);

                res.writeHead(200);
                res.end(html);
            });
        });
    } else if (pathName === "/create_process") {
        // create process
        let body = "";

        req.on("data", (data) => {
            body += data;
        });

        req.on("end", () => {
            let post = new URLSearchParams(body);

            db.query("INSERT INTO topic (title, description, created, author_id) VALUES (?, ?, NOW(), ?)", 
            [post.get("title"), post.get("description"), post.get("author")], (error, result) => {
                if (error) {
                    throw error;
                }

                res.writeHead(302, {
                    Location: `/?id=${result.insertId}`
                });
                res.end();
            });
        });
    } else if (pathName === "/update") {
        // update page
        db.query("SELECT * FROM topic", (error1, result1) => {
            if (error1) {
                throw error1;
            }

            db.query("SELECT * FROM topic where id=?", [queryData.id], (error2, result2) => {
                if (error2) {
                    throw error2;
                }

                let id = result2[0].id;
                let title = result2[0].title;
                let description = result2[0].description;
                let body = `
                    <h2>${title}</h2>
                    <article>
                        <form action="/update_process" method="post">
                            <input type="hidden" name="id" value="${id}"></input>
                            <p><input type="text" name="title" value="${title}"></input></p>
                            <p><textarea name="description" placeholder="description">${description}</textarea></p>
                            <p><input type="submit" value="update"></input></p>
                        </form>
                    </article>
                `;
                let list = template.list(result1);
                let control = `
                    <a href="/update?id=${id}">Update</a>
                `;

                let html = template.html(title, list, control, body);
    
                res.writeHead(200);
                res.end(html);
            });
        });
    } else if (pathName === "/update_process") {
        // update process
        let body = "";

        req.on("data", (data) => {
            body += data;
        });
        
        req.on("end", () => {
            let post = new URLSearchParams(body);
            let title = post.get("title");
            let description = post.get("description");
            let id = post.get("id");

            db.query("UPDATE topic SET title=? description=? author_id=1 WHERE id=?", [title, description, id], (error, result) => {
                res.writeHead(302, {
                    Location: `/?id=${id}`
                });
                res.end();
            })
        });
    } else if (pathName === "/delete_process") {
        // delete process
        let body = "";

        req.on("data", (data) => {
            body += data;
        });
        
        req.on("end", () => {
            let post = new URLSearchParams(body);
            let id = post.get("id");
            let filteredId = path.parse(id).base; 
            
            db.query("DELETE FROM topic WHERE id=?", [filteredId], (error, result) => {
                if (error) {
                    throw error;
                }

                res.writeHead(302, {
                    Location: "/"
                });
                res.end();
            });
        });
    } else {
        // error page
        res.writeHead(404);
        res.end("Not found");
    }
});

app.listen(3000);