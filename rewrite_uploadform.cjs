const fs = require('fs');

let code = `import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export default function UploadForm() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  const [repoUrl, setRepoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      setError('Por favor, preencha o título e o autor.');
      return;
    }
    
    if (!repoUrl) {
      setError('Por favor, insira a URL do repositório GitHub.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgressText('Clonando e compilando o repositório (isso pode levar alguns minutos)...');

    try {
      const simulationId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
      
      const createRes = await fetch('/api/simulations/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: simulationId,
          title,
          author,
          repoUrl,
          topics: selectedTopics
        })
      });

      if (!createRes.ok) {
        let errorMsg = 'Erro ao processar repositório GitHub.';
        try {
          const text = await createRes.text();
          try {
            const data = JSON.parse(text);
            errorMsg = data.error || errorMsg;
          } catch (e) {
            console.error('Resposta não é JSON:', text.substring(0, 100));
            if (text.includes('504 Gateway Time-out')) {
               errorMsg = 'O servidor demorou muito para responder (timeout). Tente usar um repositório mais leve ou verifique os logs do servidor.';
            } else {
               errorMsg = 'Erro inesperado no servidor. ' + text.substring(0, 50);
            }
          }
        } catch (e) {
          // ignore
        }
        throw new Error(errorMsg);
      }

      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro inesperado durante o processo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans tracking-tight">Nova Simulação</h2>
      
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
            placeholder="Ex: Queda Livre"
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
            placeholder="Ex: João Silva"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Assuntos (opcional)</label>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-64 overflow-y-auto">
            {SUBJECT_TREE.map((subject) => {
              const isSubjectSelected = selectedTopics.includes(subject.name);
              return (
                <div key={subject.name} className="mb-4 last:mb-0">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={subject.name}
                      checked={isSubjectSelected}
                      onChange={() => handleTopicToggle(subject.name)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={subject.name} className="ml-2 text-sm font-medium text-gray-900">
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
                              id={subTopic}
                              checked={isSubTopicSelected}
                              onChange={() => handleTopicToggle(subTopic)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={subTopic} className="ml-2 text-sm text-gray-700">
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

        <div>
          <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-2">
            URL do Repositório GitHub
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              id="repoUrl"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isUploading}
              className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50"
              placeholder="https://github.com/usuario/repositorio"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            O servidor tentará clonar o repositório, instalar as dependências (npm install) e rodar o comando de build (npm run build).
          </p>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span>{progressText}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out w-full animate-pulse"></div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isUploading || !title || !author || !repoUrl}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Clonar e Publicar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
`;

fs.writeFileSync('src/components/UploadForm.tsx', code);
