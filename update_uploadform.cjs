const fs = require('fs');
let code = fs.readFileSync('src/components/UploadForm.tsx', 'utf8');

const SUBJECT_TREE = `
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

`;

code = code.replace('export default function UploadForm', SUBJECT_TREE + 'export default function UploadForm');

code = code.replace("const [author, setAuthor] = useState('');", "const [author, setAuthor] = useState('');\n  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);");

code = code.replace("id: simulationId,\n        title,\n        author", "id: simulationId,\n        title,\n        author,\n        topics: selectedTopics");
code = code.replace("id: simulationId,\n        title,\n        author,\n        repoUrl", "id: simulationId,\n        title,\n        author,\n        repoUrl,\n        topics: selectedTopics");

// Add handleTopicToggle
const toggleFunc = `
  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };
`;
code = code.replace('const handleFileChange =', toggleFunc + '\n  const handleFileChange =');

// Add topics UI
const topicsUI = `
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
`;

code = code.replace('{activeTab === \'zip\' ? (', topicsUI + '\n        {activeTab === \'zip\' ? (');

fs.writeFileSync('src/components/UploadForm.tsx', code);
