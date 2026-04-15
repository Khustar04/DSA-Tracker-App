import { useState, useEffect } from 'react';
import { striverA2Z, TOTAL_STRIVER_PROBLEMS } from '../data/striverA2Z';
import StepAccordion from '../components/Striver/StepAccordion';
import supabaseService from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function StriverPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const data = await supabaseService.getStriverProgress(user.id);
      setProgress(data);
    } catch (error) {
      console.error('Striver progress load failed:', error);
      toast.error('Failed to load Striver progress');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProblem = async (problemId, isSolved) => {
    // Optimistic UI update
    setProgress(prev => ({
      ...prev,
      [problemId]: isSolved
    }));

    if (isSolved) {
      toast.success('Problem marked as solved!', {
        style: { background: '#111', color: '#fff', border: '1px solid #222' }
      });
    }

    await supabaseService.toggleStriverProblem(user.id, problemId, isSolved);
  };

  const totalSolved = Object.keys(progress).filter(key => progress[key]).length;
  const progressPercentage = TOTAL_STRIVER_PROBLEMS === 0 ? 0 : Math.round((totalSolved / TOTAL_STRIVER_PROBLEMS) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-xl">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 mb-2">
            Striver A2Z DSA Sheet
          </h1>
          <p className="text-sm text-white/50 max-w-xl">
            Complete the ultimate DSA sheet to master your skills. Track your progress below.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="text-3xl font-mono font-bold text-neon-green flex items-baseline gap-2">
            {totalSolved}
            <span className="text-lg text-white/40 font-body">/ {TOTAL_STRIVER_PROBLEMS}</span>
          </div>
          <div className="w-48 h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-neon-green/50 to-neon-green rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {striverA2Z.map((step) => (
          <StepAccordion
            key={step.step}
            step={step.step}
            title={step.title}
            problems={step.problems}
            progress={progress}
            onToggleProblem={handleToggleProblem}
          />
        ))}
      </div>
    </div>
  );
}
