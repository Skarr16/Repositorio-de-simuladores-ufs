import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Maximize2, Loader2, AlertCircle } from 'lucide-react';
import type { Simulation } from '../types';

export default function SimulationViewer() {
  const { id } = useParams<{ id: string }>();
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/simulations')
      .then(res => res.json())
      .then((data: Simulation[]) => {
        const found = data.find(s => s.id === id);
        if (found) {
          setSimulation(found);
        } else {
          setError('Simulação não encontrada.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Erro ao carregar os dados da simulação.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops!</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/" className="text-blue-600 hover:underline font-medium">
          Voltar para o início
        </Link>
      </div>
    );
  }

  const iframeUrl = `/storage/simulacoes/${simulation.id}/index.html`;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Link 
            to="/" 
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{simulation.title}</h2>
            <p className="text-sm text-gray-500">Desenvolvido por {simulation.author}</p>
          </div>
        </div>
        <button 
          onClick={() => window.open(iframeUrl, '_blank')}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          Tela Cheia
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
        {iframeLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-sm text-gray-500 font-medium">Carregando ambiente da simulação...</p>
          </div>
        )}
        <iframe
          src={iframeUrl}
          className="w-full h-full border-0"
          title={simulation.title}
          onLoad={() => setIframeLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-downloads"
        />
      </div>
    </div>
  );
}
