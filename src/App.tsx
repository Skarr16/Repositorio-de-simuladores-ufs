import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Beaker } from 'lucide-react';
import SimulationList from './components/SimulationList';
import UploadForm from './components/UploadForm';
import SimulationViewer from './components/SimulationViewer';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="bg-blue-600 text-white p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
                  <Beaker className="w-6 h-6" />
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">Physica Lab</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link to="/upload" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Publicar
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<SimulationList />} />
            <Route path="/upload" element={<UploadForm />} />
            <Route path="/view/:id" element={<SimulationViewer />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
