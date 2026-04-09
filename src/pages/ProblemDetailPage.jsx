import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import supabaseService from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Tag, Lightbulb, ExternalLink } from 'lucide-react';

export default function ProblemDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // States to keep track of tooltips
  const [hintHoverStates, setHintHoverStates] = useState([false, false, false]);

  useEffect(() => {
    if (user && id) {
      loadProblem();
    }
  }, [user, id]);

  const loadProblem = async () => {
    setLoading(true);
    const data = await supabaseService.getCustomProblem(id);
    setProblem(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-white/50">Problem not found.</h2>
        <Link to="/custom-sheets" className="text-neon-green mt-4 inline-block hover:underline">
          Go back to Custom Sheets
        </Link>
      </div>
    );
  }

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (diff === 'Medium') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    if (diff === 'Hard') return 'text-red-400 bg-red-400/10 border-red-400/20';
    return 'text-white/70 bg-white/5 border-white/10';
  };

  // Safe JSON parsers
  let parsedExamples = [];
  try {
    const raw = JSON.parse(problem.examples);
    if (Array.isArray(raw)) parsedExamples = raw;
    else if (problem.examples) parsedExamples = [{ input: problem.examples }];
  } catch (e) {
    if (problem.examples) parsedExamples = [{ input: problem.examples }];
  }

  let parsedHints = [];
  try {
    const raw = JSON.parse(problem.hint);
    if (Array.isArray(raw)) parsedHints = raw.filter(h => h.trim() !== '');
    else if (problem.hint) parsedHints = [problem.hint];
  } catch (e) {
    if (problem.hint) parsedHints = [problem.hint];
  }

  return (
    <div className="relative max-w-4xl mx-auto space-y-8 animate-fade-in text-white pb-12">
      <Link 
        to={`/custom-sheets/${problem.sheet_id}`} 
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft size={16} /> Back to Sheet
      </Link>

      {/* Header section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">
            {problem.problem_title}
          </h1>
          {problem.problem_link && (
            <a 
              href={problem.problem_link} 
              target="_blank" 
              rel="noreferrer" 
              className="text-neon-green/80 hover:text-neon-green bg-neon-green/10 p-2 rounded-lg flex items-center gap-2 transition-colors border border-neon-green/20"
              title="Solve on external platform"
            >
              <span className="text-sm font-mono hidden sm:inline">Solve</span>
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          
          {(problem.topics || []).length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">
              <Tag size={12} className="opacity-70" />
              <span>{problem.topics.join(', ')}</span>
            </div>
          )}

          {parsedHints.map((hintText, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70 relative group cursor-pointer"
              onMouseEnter={() => {
                const newStates = [...hintHoverStates];
                newStates[idx] = true;
                setHintHoverStates(newStates);
              }}
              onMouseLeave={() => {
                const newStates = [...hintHoverStates];
                newStates[idx] = false;
                setHintHoverStates(newStates);
              }}
            >
              <Lightbulb size={12} className="opacity-70 text-yellow-400" />
              <span>Hint {idx + 1}</span>
              {/* Tooltip for hint */}
              <div 
                className={`absolute top-full left-0 mt-2 p-3 bg-black border border-white/10 rounded-lg text-xs w-64 pointer-events-none transition-opacity z-10 ${
                  hintHoverStates[idx] ? 'opacity-100 block' : 'opacity-0 hidden'
                }`}
              >
                {hintText}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-white/10" />

      {/* Body section */}
      <div className="prose prose-invert prose-p:text-white/80 prose-headings:text-white max-w-none">
        
        {/* Problem Statement */}
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-sans text-white/90">
          {problem.problem_statement}
        </div>

        {/* Examples Block */}
        {parsedExamples.length > 0 && (
          <div className="mt-8 space-y-6">
            {parsedExamples.map((ex, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-bold mb-4">Example {idx + 1}:</h3>
                <div className="border-l-2 border-white/20 pl-4 py-1 space-y-2 bg-[#1a1a1a] p-4 rounded-r-lg font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-inner text-white/80">
                  {ex.input && <div><span className="font-bold text-white">Input:</span> {ex.input}</div>}
                  {ex.output && <div><span className="font-bold text-white">Output:</span> {ex.output}</div>}
                  {ex.explanation && <div><span className="font-bold text-white">Explanation:</span> {ex.explanation}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formats Block */}
        {(problem.input_format || problem.output_format) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {problem.input_format && (
              <div>
                <h4 className="font-semibold text-white/80 mb-2 text-sm uppercase tracking-wider">Input Format</h4>
                <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-sm font-mono text-white/70 whitespace-pre-wrap">
                  {problem.input_format}
                </div>
              </div>
            )}
            {problem.output_format && (
              <div>
                <h4 className="font-semibold text-white/80 mb-2 text-sm uppercase tracking-wider">Output Format</h4>
                <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-sm font-mono text-white/70 whitespace-pre-wrap">
                  {problem.output_format}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
