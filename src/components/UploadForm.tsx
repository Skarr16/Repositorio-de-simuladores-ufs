import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { Upload, FileArchive, CheckCircle2, AlertCircle, Loader2, Globe, FileBox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UploadForm() {
  const [activeTab, setActiveTab] = useState<'zip' | 'github'>('zip');
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  
  // ZIP fields
  const [file, setFile] = useState<File | null>(null);
  
  // GitHub fields
  const [repoUrl, setRepoUrl] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.zip')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Por favor, envie um arquivo .zip');
      }
    }
  };

  const handleSubmitZip = async () => {
    if (!file) return;
    
    // 1. Read and extract zip using JSZip
    setProgressText('Lendo arquivo .zip...');
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    
    let hasIndexHtml = false;
    let rootPath = '';
    let isSourceCode = false;
    
    for (const relativePath of Object.keys(zipContent.files)) {
      if (relativePath.endsWith('index.html')) {
        hasIndexHtml = true;
        rootPath = relativePath.replace('index.html', '');
      }
      if (relativePath.includes('vite.config.ts') || relativePath.includes('src/main.tsx') || relativePath.endsWith('.tsx')) {
        isSourceCode = true;
      }
    }

    if (isSourceCode) {
      throw new Error('Parece que você enviou o código-fonte do projeto. Para código-fonte, use a opção de "Repositório GitHub" ou envie apenas a pasta compilada (ex: "dist").');
    }

    if (!hasIndexHtml) {
      throw new Error('Arquivo index.html não encontrado no .zip. Certifique-se de que a simulação foi exportada corretamente.');
    }

    const simulationId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);

    setProgressText('Registrando simulação...');
    const createRes = await fetch('/api/simulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: simulationId,
        title,
        author
      })
    });

    if (!createRes.ok) {
      throw new Error('Erro ao registrar simulação no banco de dados.');
    }

    const filesToUpload = Object.values(zipContent.files).filter(f => !f.dir);
    let uploadedCount = 0;
    
    setProgressText('Enviando arquivos extraídos...');
    const chunkSize = 5;
    for (let i = 0; i < filesToUpload.length; i += chunkSize) {
      const chunk = filesToUpload.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async (zipFile) => {
        const targetPath = rootPath ? zipFile.name.replace(rootPath, '') : zipFile.name;
        
        let blob = await zipFile.async('blob');
        
        if (zipFile.name.endsWith('index.html')) {
          let htmlContent = await zipFile.async('text');
          
          htmlContent = htmlContent.replace(/src="\//g, 'src="./');
          htmlContent = htmlContent.replace(/href="\//g, 'href="./');

          const baseTag = `<base href="/storage/simulacoes/${simulationId}/">`;
          if (htmlContent.includes('<head>')) {
            htmlContent = htmlContent.replace('<head>', `<head>\n    ${baseTag}`);
          } else {
            htmlContent = baseTag + '\n' + htmlContent;
          }
          
          blob = new Blob([htmlContent], { type: 'text/html' });
        }

        const fileToUpload = new File([blob], targetPath, { type: 'application/octet-stream' });
        const formData = new FormData();
        formData.append('file', fileToUpload, zipFile.name.split('/').pop() || 'file');
        formData.append('relativePath', targetPath);

        const uploadRes = await fetch(`/api/simulations/${simulationId}/upload`, {
          method: 'POST',
          body: formData
        });

        if (!uploadRes.ok) {
          console.error(`Falha ao enviar arquivo: ${targetPath}`);
        }
        
        uploadedCount++;
        setProgress(Math.round((uploadedCount / filesToUpload.length) * 100));
      }));
    }
  };

  const handleSubmitGithub = async () => {
    if (!repoUrl) return;
    
    const simulationId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
    setProgressText('Clonando e compilando o repositório (isso pode levar alguns minutos)...');
    
    const createRes = await fetch('/api/simulations/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: simulationId,
        title,
        author,
        repoUrl
      })
    });

    if (!createRes.ok) {
      const data = await createRes.json();
      throw new Error(data.error || 'Erro ao processar repositório GitHub.');
    }
    
    setProgress(100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      setError('Por favor, preencha o título e o autor.');
      return;
    }

    if (activeTab === 'zip' && !file) {
      setError('Por favor, selecione um arquivo .zip.');
      return;
    }
    
    if (activeTab === 'github' && !repoUrl) {
      setError('Por favor, insira a URL do repositório GitHub.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);
    setProgressText('Iniciando...');

    try {
      if (activeTab === 'zip') {
        await handleSubmitZip();
      } else {
        await handleSubmitGithub();
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

      <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('zip')}
          className={`flex-1 flex justify-center items-center py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'zip' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileBox className="w-4 h-4 mr-2" />
          Arquivo .ZIP
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('github')}
          className={`flex-1 flex justify-center items-center py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'github' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Globe className="w-4 h-4 mr-2" />
          Repositório GitHub
        </button>
      </div>

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

        {activeTab === 'zip' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo da Simulação (.zip)
            </label>
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".zip"
                className="hidden"
                disabled={isUploading}
              />
              
              {file ? (
                <div className="flex flex-col items-center">
                  <FileArchive className="w-10 h-10 text-blue-500 mb-3" />
                  <p className="text-sm font-medium text-blue-900">{file.name}</p>
                  <p className="text-xs text-blue-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  {!isUploading && (
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="mt-4 text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Remover e escolher outro
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-900">Clique para selecionar ou arraste o arquivo</p>
                  <p className="text-xs text-gray-500 mt-1">Apenas arquivos .zip contendo a versão compilada (index.html)</p>
                </div>
              )}
            </div>
          </div>
        ) : (
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
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span>{progressText}</span>
              {activeTab === 'zip' && <span>{progress}%</span>}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out ${activeTab === 'github' ? 'w-full animate-pulse' : ''}`}
                style={{ width: activeTab === 'zip' ? `${progress}%` : '100%' }}
              ></div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isUploading || !title || !author || (activeTab === 'zip' ? !file : !repoUrl)}
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
                {activeTab === 'zip' ? 'Publicar Simulação' : 'Clonar e Publicar'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
