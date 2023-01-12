const db = require("../lib/db");
const template = require("../lib/template");
const url = require("url");
const sanitizeHtml = require("sanitize-html");

const author = {
    home: (req, res) => {
        db.query("SELECT * FROM author", (error, result) => {
            // welcome page
            let title = "Author";
            let description = "";
            let body = template.authorTable(result); //
            let list = "";
            let control = `
                <p><a href="/author/create">Create</a></p>
            `;
            let html = template.html(title, list, control, body);

            res.writeHead(200);
            res.end(html);
        });
    },
    create: (req, res) => {
        db.query("SELECT * FROM author", (error, result) => {
            let title = "Author";
            let body = `
                ${template.authorTable(result)}
                <article>
                    <form action="/author/create_process" method="post">
                        <p><input type="text" name="name" placeholder="name"></input></p>
                        <p><textarea name="profile" placeholder="profile"></textarea></p>
                        <p><input type="submit" value="create"></input></p>
                    </form>
                </article>
            `;
            let list = "";
            let control = "";
            let html = template.html(title, list, control, body);

            res.writeHead(200);
            res.end(html);
        });
    },
    createProcess: (req, res) => {
        let body = "";

        req.on("data", (data) => {
            body += data;
        });

        req.on("end", () => {
            let post = new URLSearchParams(body);

            db.query("INSERT INTO author (name, profile) VALUES (?, ?)", [post.get("name"), post.get("profile")], (error, result) => {
                if (error) {
                    throw error;
                }

                res.writeHead(302, {
                    Location: `/author`
                });
                res.end();
            });
        });
    },
    update: (req, res) => {
        let _url = req.url;
        let queryData = url.parse(_url, true).query;

        db.query("SELECT * FROM author", (error1, result1) => {
            if (error1) {
                throw error1;
            }

            db.query("SELECT * FROM author WHERE id=?", [queryData.id], (error2, result2) => {
                if (error2) {
                    throw error2;
                }

                let title = "Author";
                let body = `
                    ${template.authorTable(result1)}
                    <article>
                        <form action="/author/update_process" method="post">
                            <p><input type="hidden" name="id" value="${queryData.id}"></p>
                            <p><input type="text" name="name" value="${sanitizeHtml(result2[0].name)}"></input></p>
                            <p><textarea name="profile">${sanitizeHtml(result2[0].profile)}</textarea></p>
                            <p><input type="submit" value="update"></input></p>
                        </form>
                    </article>
                `;
                let list = "";
                let control = "";
                let html = template.html(title, list, control, body);

                res.writeHead(200);
                res.end(html);
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

            db.query("UPDATE author SET name=?, profile=? WHERE id=?", [post.get("name"), post.get("profile"), post.get("id")], (error, result) => {
                if (error) {
                    throw error;
                }

                res.writeHead(302, { Location: "/author" });
                res.end();
            });
        });
    },
    deleteProcess: (req, res) => {
        let body = "";
        
        req.on("data", (data) => {
            body = body + data;
        });

        req.on("end", () => {
            let post = new URLSearchParams(body);
            let id = post.get("id");
            
            db.query("DELETE FROM topic WHERE author_id=?", [id], (error1, result1) => {
                if (error1) {
                    throw error1;
                }

                db.query(`DELETE FROM author WHERE id=?`, [id], (error2, result2) => {
                    if (error2) {
                        throw error2;
                    }
    
                    res.writeHead(302, {Location: `/author`});
                    res.end();
                });
            });
        });
    }
};

module.exports = author;