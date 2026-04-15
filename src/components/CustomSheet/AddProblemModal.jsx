import { useState, useEffect } from 'react';
import { X, Plus, Trash } from 'lucide-react';

const TOPICS_LIST = [
  "Arrays", "Strings", "LinkedList", "Trees", "BST", "Graphs", "DP", 
  "Greedy", "Binary Search", "Stack", "Queue", "Heap", "Recursion", "Math"
];

export default function AddProblemModal({ isOpen, onClose, onAdd, initialData = null }) {
  const [formData, setFormData] = useState({
    problem_title: '',
    difficulty: 'Easy',
    problem_link: '',
    leetcode_link: '',
    gfg_link: '',
    problem_statement: '',
    input_format: '',
    output_format: ''
  });
  
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);
  const [hints, setHints] = useState(['', '', '']);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        problem_title: initialData.problem_title || '',
        difficulty: initialData.difficulty || 'Easy',
        problem_link: initialData.problem_link || '',
        leetcode_link: initialData.leetcode_link || '',
        gfg_link: initialData.gfg_link || '',
        problem_statement: initialData.problem_statement || '',
        input_format: initialData.input_format || '',
        output_format: initialData.output_format || ''
      });
      setSelectedTopics(initialData.topics || []);
      
      // Parse examples safely
      try {
        const parsedEx = JSON.parse(initialData.examples);
        if (Array.isArray(parsedEx)) {
          setExamples(parsedEx.length > 0 ? parsedEx : [{ input: '', output: '', explanation: '' }]);
        } else {
          // It was a string from before
          setExamples([{ input: initialData.examples || '', output: '', explanation: '' }]);
        }
      } catch (e) {
        setExamples([{ input: initialData.examples || '', output: '', explanation: '' }]);
      }

      // Parse hints safely
      try {
        const parsedHints = JSON.parse(initialData.hint);
        if (Array.isArray(parsedHints)) {
          setHints([
            parsedHints[0] || '',
            parsedHints[1] || '',
            parsedHints[2] || ''
          ]);
        } else {
          setHints([initialData.hint || '', '', '']);
        }
      } catch (e) {
        setHints([initialData.hint || '', '', '']);
      }
    } else if (isOpen) {
      // Reset for new addition
      setFormData({
        problem_title: '', difficulty: 'Easy', problem_link: '', leetcode_link: '', gfg_link: '', problem_statement: '',
        input_format: '', output_format: ''
      });
      setSelectedTopics([]);
      setExamples([{ input: '', output: '', explanation: '' }]);
      setHints(['', '', '']);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleTopic = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleExampleChange = (index, field, value) => {
    const newEx = [...examples];
    newEx[index][field] = value;
    setExamples(newEx);
  };

  const addExample = () => setExamples([...examples, { input: '', output: '', explanation: '' }]);
  const removeExample = (index) => setExamples(examples.filter((_, i) => i !== index));

  const handleHintChange = (index, value) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTopics.length === 0) {
      alert('Please select at least one topic.');
      return;
    }
    
    // Clean data before sending
    const cleanedExamples = examples.filter(ex => ex.input.trim() || ex.output.trim() || ex.explanation.trim());
    
    onAdd({
      ...formData,
      topics: selectedTopics,
      examples: JSON.stringify(cleanedExamples),
      hint: JSON.stringify(hints)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header - Fixed top */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
          <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Problem' : 'Add Custom Problem'}</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form body - Scrollable */}
        <div className="overflow-y-auto p-6 flex-1">
          <form id="add-problem-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Core Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-mono text-white/50 uppercase">Problem Title *</label>
                <input required name="problem_title" value={formData.problem_title} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-white/50 uppercase">Difficulty *</label>
                <select required name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-white/50 uppercase">Topics *</label>
              <div className="flex flex-wrap gap-2">
                {TOPICS_LIST.map(topic => (
                  <button
                    type="button"
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      selectedTopics.includes(topic)
                        ? 'border-neon-green bg-neon-green/20 text-neon-green'
                        : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-white/50 uppercase">Problem Statement *</label>
              <textarea required name="problem_statement" value={formData.problem_statement} onChange={handleChange} rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50 resize-y" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-white/50 uppercase">Problem Link</label>
              <input type="url" name="problem_link" value={formData.problem_link} onChange={handleChange} placeholder="https://leetcode.com/..." className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-mono text-white/50 uppercase">LeetCode Link</label>
                <input type="url" name="leetcode_link" value={formData.leetcode_link} onChange={handleChange} placeholder="https://leetcode.com/problems/..." className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-white/50 uppercase">GFG Link</label>
                <input type="url" name="gfg_link" value={formData.gfg_link} onChange={handleChange} placeholder="https://www.geeksforgeeks.org/..." className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
              </div>
            </div>

            {/* In/Out Formats Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 border border-white/5 bg-white/5 rounded-lg">
              <div className="space-y-1">
                <label className="text-xs font-mono text-white/50 uppercase">Input Format</label>
                <textarea name="input_format" value={formData.input_format} onChange={handleChange} rows={2} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-white/50 uppercase">Output Format</label>
                <textarea name="output_format" value={formData.output_format} onChange={handleChange} rows={2} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
              </div>
            </div>

            {/* Custom Dynamic Examples Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-white/50 uppercase">Examples</label>
                <button type="button" onClick={addExample} className="text-neon-green text-xs flex items-center gap-1 hover:underline">
                  <Plus size={14} /> Add Example
                </button>
              </div>
              
              {examples.map((ex, index) => (
                <div key={index} className="p-4 border border-white/10 rounded-lg bg-black/20 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white/70">Example {index + 1}</span>
                    {examples.length > 1 && (
                      <button type="button" onClick={() => removeExample(index)} className="text-white/30 hover:text-red-400">
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase">Input</label>
                      <textarea value={ex.input} onChange={e => handleExampleChange(index, 'input', e.target.value)} rows={2} className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase">Output</label>
                      <textarea value={ex.output} onChange={e => handleExampleChange(index, 'output', e.target.value)} rows={2} className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase">Explanation (Optional)</label>
                    <textarea value={ex.explanation} onChange={e => handleExampleChange(index, 'explanation', e.target.value)} rows={1} className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
                  </div>
                </div>
              ))}
            </div>

            {/* 3 Hints Section */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono text-white/50 uppercase">Hints</label>
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-2 text-xs font-mono text-white/30 w-12 shrink-0">Hint {i+1}</span>
                  <input 
                    type="text" 
                    value={hints[i]} 
                    onChange={e => handleHintChange(i, e.target.value)} 
                    placeholder={`Optional hint ${i+1}...`}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" 
                  />
                </div>
              ))}
            </div>

          </form>
        </div>

        {/* Footer - Fixed bottom */}
        <div className="p-4 border-t border-white/5 flex justify-end gap-3 shrink-0 bg-[#111] rounded-b-xl">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button type="submit" form="add-problem-form" className="px-5 py-2 rounded-lg text-sm font-medium bg-neon-green text-black hover:bg-neon-green/90 transition-colors shadow-[0_0_15px_rgba(8,255,8,0.2)]">
            {initialData ? 'Update Problem' : 'Save Problem'}
          </button>
        </div>
      </div>
    </div>
  );
}
