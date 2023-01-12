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
            list += `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
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

            tag += `<option value="${authors[i].id}" ${selected ? " selected" : ""}>${authors[i].name}</option>`;
            ++i;
        }

        return `<select name="author">${tag}</select>`;
    }
}

module.exports = template;