const fs = require('fs');
let code = fs.readFileSync('src/components/SimulationList.tsx', 'utf8');

const SUBJECT_TREE = `
const SUBJECT_TREE = [
  {
    name: 'Física',
    subTopics: [
      'Movimento',
      'Som & Ondas',
      'Trabalho, Energia & Potência',
      'Calor & Termometria',
      'Fenômenos Quânticos',
      'Luz & Radiação',
      'Eletricidade, Ímãs & Circuitos'
    ]
  },
  {
    name: 'Matemática & Estatística',
    subTopics: [
      'Conceitos Matemáticos',
      'Matemática Aplicada'
    ]
  },
  {
    name: 'Química',
    subTopics: [
      'Química Geral',
      'Química Quântica'
    ]
  },
  {
    name: 'Terra & Espaço',
    subTopics: []
  },
  {
    name: 'Biologia',
    subTopics: []
  }
];
`;

code = code.replace("import type { Simulation } from '../types';", "import type { Simulation } from '../types';\n" + SUBJECT_TREE);
code = code.replace("import { Play, User, Calendar, Plus, Box } from 'lucide-react';", "import { Play, User, Calendar, Plus, Box, Search, Filter } from 'lucide-react';");

code = code.replace("const [simulations, setSimulations] = useState<Simulation[]>([]);", "const [simulations, setSimulations] = useState<Simulation[]>([]);\n  const [searchQuery, setSearchQuery] = useState('');\n  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);\n  const [showFilters, setShowFilters] = useState(false);");

const filterLogic = `
  const filteredSimulations = simulations.filter(sim => {
    const matchesSearch = sim.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sim.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedTopics.length === 0) return matchesSearch;
    
    const simTopics = sim.topics || [];
    const matchesTopics = selectedTopics.some(topic => simTopics.includes(topic));
    
    return matchesSearch && matchesTopics;
  });

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };
`;

code = code.replace("if (loading) {", filterLogic + "\n  if (loading) {");

const filterUI = `
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar simulações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtrar por Assunto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUBJECT_TREE.map((subject) => {
              const isSubjectSelected = selectedTopics.includes(subject.name);
              return (
                <div key={subject.name} className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={'filter-'+subject.name}
                      checked={isSubjectSelected}
                      onChange={() => handleTopicToggle(subject.name)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={'filter-'+subject.name} className="ml-2 font-medium text-gray-900">
                      {subject.name}
                    </label>
                  </div>
                  {subject.subTopics.length > 0 && (
                    <div className="ml-6 space-y-2">
                      {subject.subTopics.map((subTopic) => {
                        const isSubTopicSelected = selectedTopics.includes(subTopic);
                        return (
                          <div key={subTopic} className="flex items-center">
                            <input
                              type="checkbox"
                              id={'filter-'+subTopic}
                              checked={isSubTopicSelected}
                              onChange={() => handleTopicToggle(subTopic)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={'filter-'+subTopic} className="ml-2 text-sm text-gray-600">
                              {subTopic}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
`;

code = code.replace("{simulations.length === 0 ?", filterUI + "\n      {filteredSimulations.length === 0 ? (");
code = code.replace("simulations.map((sim)", "filteredSimulations.map((sim)");

const cardTopics = `
                    {sim.topics && sim.topics.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {sim.topics.slice(0, 3).map(topic => (
                          <span key={topic} className="px-2 py-0.5 bg-blue-500/20 text-blue-100 text-xs rounded-full whitespace-nowrap">
                            {topic}
                          </span>
                        ))}
                        {sim.topics.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-500/20 text-gray-200 text-xs rounded-full">
                            +{sim.topics.length - 3}
                          </span>
                        )}
                      </div>
                    )}
`;

code = code.replace("</div>\n                                    <div className=\"flex items-center justify-center", cardTopics + "</div>\n                                    <div className=\"flex items-center justify-center");

fs.writeFileSync('src/components/SimulationList.tsx', code);
