const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "interface SimulationRecord {\n  id: string;\n  title: string;\n  author: string;\n  createdAt: string;\n  topics?: string[];\n}",
  "interface SimulationRecord {\n  id: string;\n  title: string;\n  author: string;\n  createdAt: string;\n  topics?: string[];\n  themes?: string[];\n}"
);

code = code.replace(
  "const { id, title, author, topics } = req.body;",
  "const { id, title, author, topics, themes } = req.body;"
);

code = code.replace(
  "topics: topics || []\n      });",
  "topics: topics || [],\n        themes: themes || []\n      });"
);

code = code.replace(
  "const { id, title, author, repoUrl, topics } = req.body;",
  "const { id, title, author, repoUrl, topics, themes } = req.body;"
);

code = code.replace(
  "topics: topics || []\n      });",
  "topics: topics || [],\n        themes: themes || []\n      });"
);

fs.writeFileSync('server.ts', code);
