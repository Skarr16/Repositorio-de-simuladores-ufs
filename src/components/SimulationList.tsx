import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, User, Calendar, Plus, Box } from 'lucide-react';
import type { Simulation } from '../types';

export default function SimulationList() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
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

      {simulations.length === 0 ? (
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
          {simulations.map((sim) => (
            <div key={sim.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <a href={`/storage/simulacoes/${sim.id}/index.html`} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-video bg-gray-100 overflow-hidden group">
                <div className="absolute inset-0 origin-top-left" style={{ width: '400%', height: '400%', transform: 'scale(0.25)' }}>
                  <iframe 
                    src={`/storage/simulacoes/${sim.id}/index.html`} 
                    className="w-full h-full border-0 pointer-events-none" 
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                </div>
              </a>
              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  <Link to={`/view/${sim.id}`} className="hover:text-blue-600 transition-colors">
                    {sim.title}
                  </Link>
                </h3>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{sim.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date(sim.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 border-t border-gray-100">
                <a
                  href={`/storage/simulacoes/${sim.id}/index.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Abrir em Tela Cheia
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
