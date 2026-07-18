const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const updateFunc = `
async function updateSimulation(id: string, updates: Partial<SimulationRecord>) {
  const sims = await getSimulations();
  const index = sims.findIndex(s => s.id === id);
  if (index !== -1) {
    sims[index] = { ...sims[index], ...updates };
    await fs.promises.writeFile(DB_FILE, JSON.stringify(sims, null, 2));
    return sims[index];
  }
  throw new Error("Simulation not found");
}
`;

code = code.replace("async function deleteSimulation", updateFunc + "\nasync function deleteSimulation");

const putRoute = `
  app.put('/api/simulations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, author, topics } = req.body;
      
      const updated = await updateSimulation(id, {
        title,
        author,
        topics: topics || []
      });
      
      res.json({ success: true, simulation: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update simulation' });
    }
  });
`;

code = code.replace("app.delete('/api/simulations/:id'", putRoute + "\n  app.delete('/api/simulations/:id'");

fs.writeFileSync('server.ts', code);
