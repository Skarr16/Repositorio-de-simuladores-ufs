import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

// ---------------------------------------------------------
// DATABASE INITIALIZATION (JSON based)
// ---------------------------------------------------------
const DB_FILE = './simulations.json';

interface SimulationRecord {
  id: string;
  title: string;
  author: string;
  createdAt: string;
}

async function initDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
  }
}

async function getSimulations(): Promise<SimulationRecord[]> {
  const data = await fs.promises.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

async function saveSimulation(sim: SimulationRecord) {
  const sims = await getSimulations();
  sims.push(sim);
  await fs.promises.writeFile(DB_FILE, JSON.stringify(sims, null, 2));
}

async function deleteSimulation(id: string) {
  let sims = await getSimulations();
  sims = sims.filter(s => s.id !== id);
  await fs.promises.writeFile(DB_FILE, JSON.stringify(sims, null, 2));
}

// ---------------------------------------------------------
// EXPRESS APP
// ---------------------------------------------------------
async function startServer() {
  await initDb();
  
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Setup uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads', 'simulacoes');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Set up multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const simId = String(req.params.id);
      const simDir = path.join(uploadsDir, simId);
      
      // We receive relativePath from the body to preserve folder structure
      const relativePath: string = typeof req.body.relativePath === 'string' 
        ? req.body.relativePath 
        : (Array.isArray(req.body.relativePath) ? req.body.relativePath[0] : file.originalname);
      const fileDir = path.dirname(path.join(simDir, relativePath));
      
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      cb(null, fileDir);
    },
    filename: (req, file, cb) => {
      const relativePath: string = typeof req.body.relativePath === 'string' 
        ? req.body.relativePath 
        : (Array.isArray(req.body.relativePath) ? req.body.relativePath[0] : file.originalname);
      cb(null, path.basename(relativePath));
    }
  });

  const upload = multer({ storage });

  // ---------------------------------------------------------
  // API ROUTES
  // ---------------------------------------------------------

  // Get all simulations
  app.get('/api/simulations', async (req, res) => {
    try {
      const simulations = await getSimulations();
      // Sort by createdAt descending
      simulations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(simulations);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch simulations' });
    }
  });

  // Create a new simulation record
  app.post('/api/simulations', async (req, res) => {
    try {
      const { id, title, author } = req.body;
      if (!id || !title || !author) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await saveSimulation({
        id,
        title,
        author,
        createdAt: new Date().toISOString()
      });
      
      res.json({ success: true, id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create simulation' });
    }
  });

  // GitHub integration
  app.post('/api/simulations/github', async (req, res) => {
    const { id, title, author, repoUrl } = req.body;
    
    if (!id || !title || !author || !repoUrl) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    if (!repoUrl.startsWith('https://github.com/')) {
      return res.status(400).json({ error: 'A URL fornecida não parece ser de um repositório GitHub válido.' });
    }

    const tempDir = path.join(process.cwd(), 'temp', id);
    const simDir = path.join(uploadsDir, id);

    try {
      if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
        fs.mkdirSync(path.join(process.cwd(), 'temp'), { recursive: true });
      }

      try {
        await execAsync(`git clone ${repoUrl} ${tempDir}`);
      } catch (cloneErr) {
        throw new Error('Não foi possível clonar o repositório. Verifique se a URL está correta e se o repositório é público.');
      }
      
      // Check for package.json
      if (fs.existsSync(path.join(tempDir, 'package.json'))) {
        // Assume it needs npm install and npm run build
        await execAsync(`npm install`, { cwd: tempDir });
        await execAsync(`npm run build`, { cwd: tempDir });
        
        const distPath = path.join(tempDir, 'dist');
        const buildPath = path.join(tempDir, 'build'); // Some create-react-app might use build
        
        const finalBuildPath = fs.existsSync(distPath) ? distPath : (fs.existsSync(buildPath) ? buildPath : null);

        if (finalBuildPath) {
          // Copy dist to simDir
          fs.cpSync(finalBuildPath, simDir, { recursive: true });
          
          // Modify index.html to add base tag for assets
          const indexPath = path.join(simDir, 'index.html');
          if (fs.existsSync(indexPath)) {
            let htmlContent = fs.readFileSync(indexPath, 'utf-8');
            htmlContent = htmlContent.replace(/src="\//g, 'src="./');
            htmlContent = htmlContent.replace(/href="\//g, 'href="./');

            const baseTag = `<base href="/storage/simulacoes/${id}/">`;
            if (htmlContent.includes('<head>')) {
              htmlContent = htmlContent.replace('<head>', `<head>\n    ${baseTag}`);
            } else {
              htmlContent = baseTag + '\n' + htmlContent;
            }
            fs.writeFileSync(indexPath, htmlContent, 'utf-8');
          }
        } else {
          throw new Error('A pasta dist/build não foi encontrada após rodar npm run build.');
        }
      } else {
        // No package.json, might be raw HTML
        if (fs.existsSync(path.join(tempDir, 'index.html'))) {
          fs.cpSync(tempDir, simDir, { recursive: true });
        } else {
          throw new Error('O repositório não contém um package.json nem um index.html na raiz.');
        }
      }

      await saveSimulation({
        id,
        title,
        author,
        createdAt: new Date().toISOString()
      });

      res.json({ success: true });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || 'Falha ao processar o repositório GitHub.' });
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  });

  // Upload a file for a specific simulation
  app.post('/api/simulations/:id/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      res.json({ success: true, filepath: req.file.path });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  // Delete a simulation (optional cleanup)
  app.delete('/api/simulations/:id', async (req, res) => {
    try {
      const simId = String(req.params.id);
      await deleteSimulation(simId);
      
      const simDir = path.join(uploadsDir, simId);
      if (fs.existsSync(simDir)) {
        fs.rmSync(simDir, { recursive: true, force: true });
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete simulation' });
    }
  });

  // Middleware to fix absolute paths requested by simulations
  app.use((req, res, next) => {
    const referer = req.headers.referer;
    if (referer && !req.path.startsWith('/api/') && !req.path.startsWith('/storage/')) {
      const match = referer.match(/\/storage\/simulacoes\/([^/]+)\//);
      if (match) {
        const simId = match[1];
        const possiblePath = path.join(uploadsDir, simId, req.path);
        if (fs.existsSync(possiblePath) && fs.statSync(possiblePath).isFile()) {
          return res.sendFile(possiblePath);
        }
      }
    }
    next();
  });

  // Serve static files for simulations
  app.use('/storage/simulacoes', express.static(uploadsDir));

  // ---------------------------------------------------------
  // VITE MIDDLEWARE & STATIC FALLBACK
  // ---------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
