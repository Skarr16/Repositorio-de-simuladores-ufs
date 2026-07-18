const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "      await saveSimulation({\n        id,\n        title,\n        author,\n        createdAt: new Date().toISOString()\n      });\n\n      res.json({ success: true });",
  "      await saveSimulation({\n        id,\n        title,\n        author,\n        createdAt: new Date().toISOString(),\n        topics: topics || [],\n        themes: themes || []\n      });\n\n      res.json({ success: true });"
);

fs.writeFileSync('server.ts', code);
