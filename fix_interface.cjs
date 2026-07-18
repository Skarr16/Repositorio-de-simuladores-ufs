const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "interface SimulationRecord {\\n  id: string;\\n  title: string;\\n  author: string;\\n  createdAt: string;\\n}",
  "interface SimulationRecord {\\n  id: string;\\n  title: string;\\n  author: string;\\n  createdAt: string;\\n  topics?: string[];\\n}"
);

fs.writeFileSync('server.ts', code);
