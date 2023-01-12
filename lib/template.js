const sanitizeHtml = require("sanitize-html");

const template = {
    html: function(title, list, control, body) {
        return `
            <!doctype html>
            <html>
            <head>
                <title>WEB2 - Node.js - ${title}</title>
                <meta charset="utf-8">
            </head>
            <body>
                <h1><a href="/">Node.js</a></h1>
                <p><a href="/author">see authors</a></p>
                ${list}
                ${control}
                ${body}
            </body>
            </html>
        `;
    },
    list: function(topics) {
        let list = "<ul>";
        let i = 0;
        while (i < topics.length) {
            list += `<li><a href="/?id=${topics[i].id}">${sanitizeHtml(topics[i].title)}</a></li>`;
            ++i;
        }
        list += "</ul>";

        return list;
    },
    authorSelect: function(authors, current_author_id) {
        let tag = "";
        let i = 0;
        while (i < authors.length) {
            let selected = false;
            if (authors[i].id === current_author_id) {
                selected = true;
            }

            tag += `<option value="${authors[i].id}" ${selected ? " selected" : ""}>${sanitizeHtml(authors[i].name)}</option>`;
            ++i;
        }

        return `<select name="author">${tag}</select>`;
    },
    authorTable: function(authors) {
        let tag = "<table>";
        let i = 0;
        while (i < authors.length) {
            tag += `
                <tr>
                    <td>${sanitizeHtml(authors[i].name)}</td>
                    <td>${sanitizeHtml(authors[i].profile)}</td>
                    <td><a href="/author/update?id=${authors[i].id}">update</a></td>
                    <td>
                        <form action="/author/delete_process" method="post">
                            <input type="hidden" name="id" value="${authors[i].id}"/>
                            <input type="submit" value="delete"/>
                        </form>
                    </td>
                </tr>
            `;
            ++i;
        }
        tag += "</table>";

        return tag;
    }
}

module.exports = template;