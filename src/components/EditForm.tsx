import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Simulation } from '../types';
import TagInput from './TagInput';

export default function EditForm() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  
  const [existingTopics, setExistingTopics] = useState<string[]>([]);
  const [existingThemes, setExistingThemes] = useState<string[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/simulations')
      .then(res => res.json())
      .then(data => {
        const topics = new Set<string>();
        const themes = new Set<string>();
        
        data.forEach((s: any) => {
          if (s.topics) s.topics.forEach((t: string) => topics.add(t));
          if (s.themes) s.themes.forEach((t: string) => themes.add(t));
        });
        
        setExistingTopics(Array.from(topics));
        setExistingThemes(Array.from(themes));
        
        const sim = data.find((s: Simulation) => s.id === id);
        if (sim) {
          setTitle(sim.title);
          setAuthor(sim.author);
          setSelectedTopics(sim.topics || []);
          setSelectedThemes(sim.themes || []);
        } else {
          setError('Simulação não encontrada.');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Erro ao carregar os dados.');
        setIsLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      setError('Por favor, preencha o título e o autor.');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/simulations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author,
          topics: selectedTopics,
          themes: selectedThemes
        })
      });
      
      if (!res.ok) {
        throw new Error('Falha ao atualizar simulação.');
      }
      navigate('/simulations');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans tracking-tight">Editar Simulação</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start text-red-700">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título da Simulação
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50"
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Autor (Desenvolvedor)
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={isUploading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50"
          />
        </div>

        <TagInput 
          label="Temas (ex: Física, Matemática)" 
          tags={selectedThemes} 
          onChange={setSelectedThemes} 
          existingTags={existingThemes} 
          placeholder="Digite um tema..." 
          disabled={isUploading} 
        />

        <TagInput 
          label="Assuntos (ex: Movimento, Geometria)" 
          tags={selectedTopics} 
          onChange={setSelectedTopics} 
          existingTags={existingTopics} 
          placeholder="Digite um assunto..." 
          disabled={isUploading} 
        />

        <div className="pt-4">
          <button
            type="submit"
            disabled={isUploading || !title || !author}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
