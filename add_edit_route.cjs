const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import UploadForm from './components/UploadForm';",
  "import UploadForm from './components/UploadForm';\nimport EditForm from './components/EditForm';"
);

code = code.replace(
  '<Route path="/upload" element={<div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"><UploadForm /></div>} />',
  '<Route path="/upload" element={<div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"><UploadForm /></div>} />\n          <Route path="/edit/:id" element={<div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"><EditForm /></div>} />'
);

fs.writeFileSync('src/App.tsx', code);
