const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "const { id, title, author } = req.body;",
  "const { id, title, author, topics } = req.body;"
).replace(
  "id,\n        title,\n        author,\n        createdAt: new Date().toISOString()",
  "id,\n        title,\n        author,\n        createdAt: new Date().toISOString(),\n        topics: topics || []"
);

code = code.replace(
  "const { id, title, author, repoUrl } = req.body;",
  "const { id, title, author, repoUrl, topics } = req.body;"
).replace(
  "id,\n        title,\n        author,\n        createdAt: new Date().toISOString()",
  "id,\n        title,\n        author,\n        createdAt: new Date().toISOString(),\n        topics: topics || []"
);

fs.writeFileSync('server.ts', code);
