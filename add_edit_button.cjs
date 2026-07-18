const fs = require('fs');
let code = fs.readFileSync('src/components/SimulationList.tsx', 'utf8');

if (!code.includes("import { Edit }")) {
  code = code.replace("Search, Filter", "Search, Filter, Edit");
}

if (!code.includes("useNavigate")) {
  code = code.replace("import { Link } from 'react-router-dom';", "import { Link, useNavigate } from 'react-router-dom';");
  code = code.replace("export default function SimulationList() {", "export default function SimulationList() {\n  const navigate = useNavigate();");
}

const editButton = `
                  <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(\`/edit/\${sim.id}\`);
                      }}
                      className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-lg transition-colors"
                      title="Editar simulação"
                    >
                      <Edit className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  
                  {/* Content below */}
                  <div className="flex-1 flex flex-col justify-end">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">
`;

code = code.replace(
  `                  <div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">`,
  editButton
);

fs.writeFileSync('src/components/SimulationList.tsx', code);
