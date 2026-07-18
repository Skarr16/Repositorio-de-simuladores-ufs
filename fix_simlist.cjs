const fs = require('fs');
let code = fs.readFileSync('src/components/SimulationList.tsx', 'utf8');

code = code.replace("{filteredSimulations.length === 0 ? ( (", "{filteredSimulations.length === 0 ? (");

fs.writeFileSync('src/components/SimulationList.tsx', code);
