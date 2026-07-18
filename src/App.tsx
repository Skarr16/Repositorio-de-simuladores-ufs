import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Beaker } from 'lucide-react';
import SimulationList from './components/SimulationList';
import UploadForm from './components/UploadForm';
import SimulationViewer from './components/SimulationViewer';
import Home from './components/Home';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isHome ? 'bg-[#4169E1]' : 'bg-gray-50'}`}>
      {!isHome && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="bg-blue-600 text-white p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
                  <Beaker className="w-6 h-6" />
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">FísicaLab UFS</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link to="/simulations" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Simulações
                </Link>
                <Link to="/upload" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Publicar
                </Link>
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/simulations" element={<div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"><SimulationList /></div>} />
          <Route path="/upload" element={<div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"><UploadForm /></div>} />
          <Route path="/view/:id" element={<div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"><SimulationViewer /></div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
