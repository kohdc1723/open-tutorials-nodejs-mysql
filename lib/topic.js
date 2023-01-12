const db = require("../lib/db");
const template = require("../lib/template");
const url = require("url");
const path = require("path");
const sanitizeHtml = require("sanitize-html");

let topic = {
    home: (req, res) => {
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
    },
    page: (req, res) => {
        let _url = req.url;
        let queryData = url.parse(_url, true).query;

        db.query("SELECT * FROM topic", (error1, result1) => {
            if (error1) {
                throw error1;
            }

            db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], (error2, result2) => {
                if (error2) {
                    throw error2;
                }

                let title = sanitizeHtml(result2[0].title);
                let description = sanitizeHtml(result2[0].description);
                let name = sanitizeHtml(result2[0].name);
                let body = `
                    <h2>${title}</h2>
                    <p>by ${name}</p>
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
    },
    create: (req, res) => {
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
    },
    createProcess: (req, res) => {
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
    },
    update: (req, res) => {
        let _url = req.url;
        let queryData = url.parse(_url, true).query;

        db.query("SELECT * FROM topic", (error1, result1) => {
            if (error1) {
                throw error1;
            }

            db.query("SELECT * FROM topic WHERE id=?", [queryData.id], (error2, result2) => {
                if (error2) {
                    throw error2;
                }

                db.query("SELECT * FROM author", (error3, result3) => {
                    if (error3) {
                        throw error3;
                    }

                    let id = result2[0].id;
                    let title = sanitizeHtml(result2[0].title);
                    let description = sanitizeHtml(result2[0].description);
                    let current_author_id = result2[0].author_id;
                    let body = `
                        <h2>${title}</h2>
                        <article>
                            <form action="/update_process" method="post">
                                <input type="hidden" name="id" value="${id}"></input>
                                <p><input type="text" name="title" value="${title}"></input></p>
                                <p><textarea name="description" placeholder="description">${description}</textarea></p>
                                <p>${template.authorSelect(result3, current_author_id)}</p>
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
        });
    },
    updateProcess: (req, res) => {
        let body = "";

        req.on("data", (data) => {
            body += data;
        });
        
        req.on("end", () => {
            let post = new URLSearchParams(body);
            let title = post.get("title");
            let description = post.get("description");
            let author = post.get("author");
            let id = post.get("id");

            db.query("UPDATE topic SET title=?, description=?, author_id=? WHERE id=?", [title, description, author, id], (error, result) => {
                if (error) {
                    throw error;
                }

                res.writeHead(302, {
                    Location: `/?id=${id}`
                });
                res.end();
            })
        });
    },
    deleteProcess: (req, res) => {
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
    },
    error: (req, res) => {
        res.writeHead(404);
        res.end("Not found");
    }
};

module.exports = topic;