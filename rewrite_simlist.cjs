const fs = require('fs');

const code = `import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, User, Calendar, Plus, Box, Search, Filter, Edit } from 'lucide-react';
import type { Simulation } from '../types';

export default function SimulationList() {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/simulations')
      .then(res => res.json())
      .then(data => {
        setSimulations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch simulations:', err);
        setLoading(false);
      });
  }, []);

  const allTopics = Array.from(new Set(simulations.flatMap(s => s.topics || []))).sort();
  const allThemes = Array.from(new Set(simulations.flatMap(s => s.themes || []))).sort();

  const filteredSimulations = simulations.filter(sim => {
    const matchesSearch = sim.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sim.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const simTopics = sim.topics || [];
    const simThemes = sim.themes || [];
    
    const matchesTopics = selectedTopics.length === 0 || selectedTopics.some(topic => simTopics.includes(topic));
    const matchesThemes = selectedThemes.length === 0 || selectedThemes.some(theme => simThemes.includes(theme));
    
    return matchesSearch && matchesTopics && matchesThemes;
  });

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };
  
  const handleThemeToggle = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">Simulações</h1>
          <p className="text-gray-500 mt-1">Explore o acervo do Physica Lab</p>
        </div>
        <Link 
          to="/upload" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Simulação
        </Link>
      </div>

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
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">Temas</h4>
              {allThemes.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {allThemes.map(theme => (
                    <div key={theme} className="flex items-center">
                      <input
                        type="checkbox"
                        id={'theme-'+theme}
                        checked={selectedThemes.includes(theme)}
                        onChange={() => handleThemeToggle(theme)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={'theme-'+theme} className="ml-2 text-sm text-gray-700">
                        {theme}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum tema disponível</p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">Assuntos</h4>
              {allTopics.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {allTopics.map(topic => (
                    <div key={topic} className="flex items-center">
                      <input
                        type="checkbox"
                        id={'topic-'+topic}
                        checked={selectedTopics.includes(topic)}
                        onChange={() => handleTopicToggle(topic)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={'topic-'+topic} className="ml-2 text-sm text-gray-700">
                        {topic}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum assunto disponível</p>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredSimulations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma simulação</h3>
          <p className="text-gray-500 mt-1">Seja o primeiro a publicar uma simulação no portal.</p>
          <div className="mt-6">
            <Link 
              to="/upload" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Fazer Upload
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSimulations.map((sim) => (
            <div key={sim.id} className="relative rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group aspect-video bg-gray-100">
              <a href={\`/storage/simulacoes/\${sim.id}/index.html\`} target="_blank" rel="noopener noreferrer" className="block relative w-full h-full">
                <div className="absolute inset-0 origin-top-left" style={{ width: '400%', height: '400%', transform: 'scale(0.25)' }}>
                  <iframe 
                    src={\`/storage/simulacoes/\${sim.id}/index.html\`} 
                    className="w-full h-full border-0 pointer-events-none" 
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-6 text-white justify-between">
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
                      {sim.title}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-300">
                        <User className="w-4 h-4 mr-2" />
                        <span>{sim.author}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(sim.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    {sim.themes && sim.themes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {sim.themes.slice(0, 3).map(theme => (
                          <span key={theme} className="px-2 py-0.5 bg-blue-500/20 text-blue-100 text-xs rounded-full whitespace-nowrap">
                            {theme}
                          </span>
                        ))}
                      </div>
                    )}
                    {sim.topics && sim.topics.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {sim.topics.slice(0, 3).map(topic => (
                          <span key={topic} className="px-2 py-0.5 bg-gray-500/30 text-gray-200 text-xs rounded-full whitespace-nowrap">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center w-full px-4 py-2 mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors font-medium">
                    <Play className="w-4 h-4 mr-2" />
                    Abrir em Tela Cheia
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/components/SimulationList.tsx', code);
