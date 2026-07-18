const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "  createdAt: string;",
  "  createdAt: string;\n  topics?: string[];"
);

fs.writeFileSync('server.ts', code);
