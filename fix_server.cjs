const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/topics: topics \|\| \[\],\n        topics: topics \|\| \[\]/g, "topics: topics || []");

fs.writeFileSync('server.ts', code);
