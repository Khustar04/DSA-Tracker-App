import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabaseService from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { Trash, Plus, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CustomSheetsPage() {
  const { user } = useAuth();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  
  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (user) {
      loadSheets();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSheets = async () => {
    setLoading(true);
    const data = await supabaseService.getCustomSheets(user.id);
    setSheets(data || []);
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    const newSheet = await supabaseService.createCustomSheet(user.id, newTitle);
    if (newSheet) {
      setSheets([newSheet, ...sheets]);
      setNewTitle('');
      toast.success('Sheet created!');
    } else {
      toast.error('Failed to create sheet');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sheet and all its problems?')) return;
    
    await supabaseService.deleteCustomSheet(user.id, id);
    setSheets(sheets.filter(s => s.id !== id));
    toast.success('Sheet deleted');
  };

  const startEdit = (sheet) => {
    setEditingId(sheet.id);
    setEditTitle(sheet.title);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return setEditingId(null);
    
    await supabaseService.updateCustomSheet(user.id, id, editTitle);
    setSheets(sheets.map(s => s.id === id ? { ...s, title: editTitle } : s));
    setEditingId(null);
    toast.success('Title updated');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h1 className="text-2xl font-bold text-white mb-2">Custom DSA Sheets</h1>
        <p className="text-sm text-white/50 mb-6">Create and manage your own custom problem lists.</p>
        
        <form onSubmit={handleCreate} className="flex gap-3 max-w-md">
          <input
            type="text"
            placeholder="Name your new sheet..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50"
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg text-sm hover:bg-neon-green/20 transition-colors font-medium cursor-pointer"
          >
            <Plus size={16} /> Create
          </button>
        </form>
      </div>

      {sheets.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-white/40">You haven't created any custom sheets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sheets.map((sheet) => (
            <div key={sheet.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-white/20 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                {editingId === sheet.id ? (
                  <form onSubmit={(e) => { e.preventDefault(); saveEdit(sheet.id); }} className="flex-1 mr-2">
                    <input
                      autoFocus
                      type="text"
                      className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-white text-lg focus:outline-none focus:border-neon-green/50"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => saveEdit(sheet.id)}
                    />
                  </form>
                ) : (
                  <Link to={`/custom-sheets/${sheet.id}`} className="text-lg font-semibold text-white/90 hover:text-neon-green transition-colors flex-1 truncate">
                    {sheet.title}
                  </Link>
                )}
                
                <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(sheet)} className="text-white/40 hover:text-white/80 p-1">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(sheet.id)} className="text-white/40 hover:text-red-400 p-1">
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-mono text-white/30">
                  Created: {new Date(sheet.created_at).toLocaleDateString()}
                </span>
                <Link to={`/custom-sheets/${sheet.id}`} className="text-xs font-mono text-neon-green/80 hover:text-neon-green underline decoration-neon-green/30 underline-offset-2">
                  View Problems →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
