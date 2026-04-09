import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import supabaseService from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, Plus, CheckCircle2, Circle, Trash, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AddProblemModal from '../components/CustomSheet/AddProblemModal';

export default function SheetViewPage() {
  const { id: sheetId } = useParams();
  const { user } = useAuth();
  
  const [sheetName, setSheetName] = useState('');
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);

  useEffect(() => {
    if (user && sheetId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, sheetId]);

  const loadData = async () => {
    setLoading(true);
    // Fetch sheet name and problems concurrently
    const [sheets, data] = await Promise.all([
      supabaseService.getCustomSheets(user.id),
      supabaseService.getCustomSheetProblems(user.id, sheetId)
    ]);
    
    const currSheet = sheets.find(s => s.id === sheetId);
    if (currSheet) setSheetName(currSheet.title);

    setProblems(data || []);
    setLoading(false);
  };

  const handleSaveProblem = async (problemData) => {
    if (editingProblem) {
      // Update existing
      const updatedProb = await supabaseService.updateCustomSheetProblem(user.id, editingProblem.id, problemData);
      if (updatedProb) {
        setProblems(problems.map(p => p.id === editingProblem.id ? updatedProb : p));
        setIsModalOpen(false);
        setEditingProblem(null);
        toast.success('Problem updated!');
      } else {
        toast.error('Failed to update problem.');
      }
    } else {
      // Create new
      const newProb = await supabaseService.createCustomSheetProblem(user.id, sheetId, problemData);
      if (newProb) {
        setProblems([...problems, newProb]);
        setIsModalOpen(false);
        toast.success('Problem added to sheet!');
      } else {
        toast.error('Failed to add problem.');
      }
    }
  };

  const openAddModal = () => {
    setEditingProblem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (problem) => {
    setEditingProblem(problem);
    setIsModalOpen(true);
  };

  const handleToggle = async (problemId, currentStatus) => {
    // Optimistic UI toggle
    setProblems(problems.map(p => p.id === problemId ? { ...p, is_solved: !currentStatus } : p));
    if (!currentStatus) toast.success('Solved!', { style: { background: '#111', color: '#fff', border: '1px solid #222' }});
    await supabaseService.toggleCustomSheetProblem(user.id, problemId, !currentStatus);
  };

  const handleDelete = async (problemId) => {
    if (!window.confirm('Delete this problem?')) return;
    await supabaseService.deleteCustomSheetProblem(user.id, problemId);
    setProblems(problems.filter(p => p.id !== problemId));
    toast.success('Problem deleted');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
      </div>
    );
  }

  const solvedCount = problems.filter(p => p.is_solved).length;
  const totalCount = problems.length;

  return (
    <div className="space-y-6 animate-fade-in relative">
      <Link to="/custom-sheets" className="inline-flex items-center gap-1 text-sm font-mono text-white/50 hover:text-white transition-colors">
        <ChevronLeft size={16} /> Back to Sheets
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-xl">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 mb-2">
            {sheetName || 'Custom Sheet'}
          </h1>
          <p className="text-sm text-white/50 max-w-xl">
            {solvedCount} / {totalCount} Problems Solved
          </p>
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-neon-green text-black rounded-lg text-sm hover:bg-neon-green/90 transition-colors font-medium shadow-[0_0_15px_rgba(8,255,8,0.2)]"
        >
          <Plus size={16} /> Add Problem
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {problems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40 mb-4">No problems in this sheet yet.</p>
            <button onClick={openAddModal} className="text-neon-green/80 hover:text-neon-green text-sm underline decoration-neon-green/30 underline-offset-4">
              Add your first problem
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-white/40 font-mono border-b border-white/5 bg-black/20">
                  <th className="py-3 px-4 font-normal w-12 text-center">No.</th>
                  <th className="py-3 px-4 font-normal w-16">Status</th>
                  <th className="py-3 px-4 font-normal">Title</th>
                  <th className="py-3 px-4 font-normal w-24">Difficulty</th>
                  <th className="py-3 px-4 font-normal">Topics</th>
                  <th className="py-3 px-4 font-normal w-20 text-center">Link</th>
                  <th className="py-3 px-4 font-normal w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, idx) => (
                  <tr key={problem.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-center text-white/30 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggle(problem.id, problem.is_solved)}
                        className="text-white/50 hover:text-neon-green transition-colors focus:outline-none flex items-center justify-center p-1 rounded-full"
                      >
                        {problem.is_solved ? (
                          <CheckCircle2 size={22} className="text-neon-green" fill="rgba(8, 255, 8, 0.1)" />
                        ) : (
                          <Circle size={22} />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <Link 
                        to={`/problem/${problem.id}`} 
                        className={`font-medium transition-colors decoration-dotted ${problem.is_solved ? 'line-through text-white/40' : 'text-white/90 hover:text-neon-green'}`}
                      >
                        {problem.problem_title}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        problem.difficulty === 'Easy' ? 'border-green-400/30 text-green-400 bg-green-400/10' :
                        problem.difficulty === 'Medium' ? 'border-yellow-400/30 text-yellow-400 bg-yellow-400/10' :
                        'border-red-400/30 text-red-400 bg-red-400/10'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(problem.topics || []).slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] font-mono bg-white/10 text-white/70 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                        {(problem.topics?.length > 3) && <span className="text-[9px] font-mono text-white/40">+{problem.topics.length - 3}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {problem.problem_link ? (
                        <a href={problem.problem_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors" title="Solve">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>
                      ) : (
                        <span className="text-white/20">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(problem)} className="text-white/30 hover:text-white transition-colors p-1 rounded">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(problem.id)} className="text-white/30 hover:text-red-400 transition-colors p-1 rounded">
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddProblemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleSaveProblem}
        initialData={editingProblem}
      />
    </div>
  );
}
