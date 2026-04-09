import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import supabaseService from '../services/supabaseService';
import { toast } from 'react-hot-toast';
import { User, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfileSetupPage() {
  const { user, profile, completeProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    about: '',
    avatar_url: ''
  });

  const [usernameStatus, setUsernameStatus] = useState('idle'); // idle, checking, valid, invalid
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user?.user_metadata?.full_name || '',
        avatar_url: user?.user_metadata?.avatar_url || '',
        username: profile?.username || ''
      }));
    }
  }, [user, profile]);

  const checkUsername = async (val) => {
    if (!val || val.length < 3) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    const isUnique = await supabaseService.checkUsernameUnique(val, user.id);
    setUsernameStatus(isUnique ? 'valid' : 'invalid');
  };

  const handleUsernameChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setFormData(prev => ({ ...prev, username: val }));
    setUsernameStatus('idle'); // Reset until blur or typing pause
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameStatus === 'invalid') {
      toast.error('Please choose a valid & unique username.');
      return;
    }

    setLoading(true);
    try {
      // Fast check right before submit just in case
      const isUnique = await supabaseService.checkUsernameUnique(formData.username, user.id);
      if (!isUnique) {
        setUsernameStatus('invalid');
        toast.error('Username is taken.');
        setLoading(false);
        return;
      }

      await supabaseService.upsertProfile(user.id, formData);
      completeProfile(formData);
      toast.success('Profile created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-neon-green/20 blur-[80px] pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-neon-green/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-green/20">
            <User className="text-neon-green" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Set up your Profile</h1>
          <p className="text-sm text-white/50">Let friends find you on the leaderboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-1">
            <label className="text-xs font-mono text-white/50 uppercase flex justify-between">
              <span>Username *</span>
              {usernameStatus === 'checking' && <span className="text-yellow-400">Checking...</span>}
              {usernameStatus === 'valid' && <span className="text-neon-green flex items-center gap-1"><CheckCircle size={12} /> Available</span>}
              {usernameStatus === 'invalid' && <span className="text-red-400 flex items-center gap-1"><AlertCircle size={12} /> Taken or too short</span>}
            </label>
            <input
              required
              value={formData.username}
              onChange={handleUsernameChange}
              onBlur={(e) => checkUsername(e.target.value)}
              placeholder="e.g. dsawarrior"
              className={`w-full bg-black/40 border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                usernameStatus === 'invalid' ? 'border-red-500/50 focus:border-red-500' : 
                usernameStatus === 'valid' ? 'border-neon-green/50 focus:border-neon-green' : 
                'border-white/10 focus:border-neon-green/50'
              }`}
            />
            <p className="text-[10px] text-white/30 hidden sm:block">Only lowercase letters, numbers, and underscores. Min 3 chars.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-white/50 uppercase">Full Name *</label>
            <input
              required
              value={formData.full_name}
              onChange={(e) => setFormData(p => ({...p, full_name: e.target.value}))}
              placeholder="Your display name"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-green/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-white/50 uppercase">About (Optional)</label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData(p => ({...p, about: e.target.value}))}
              placeholder="I love solving DP problems..."
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-green/50 resize-y"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-white/50 uppercase block mb-2">Profile Picture (Optional)</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-black/40 hover:bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-colors w-full text-center">
                <span>Upload from Computer</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error('Image must be less than 2MB');
                      return;
                    }
                    toast.loading('Uploading image...', { id: 'upload' });
                    try {
                      const url = await supabaseService.uploadAvatar(user.id, file);
                      setFormData(p => ({...p, avatar_url: url}));
                      toast.success('Image uploaded!', { id: 'upload' });
                    } catch (err) {
                      toast.error('Failed to upload image.', { id: 'upload' });
                    }
                  }}
                  className="hidden"
                />
              </label>
              {(formData.avatar_url || profile?.avatar_url) && (
                <button 
                  type="button" 
                  onClick={() => setFormData(p => ({...p, avatar_url: ''}))}
                  className="text-white/40 hover:text-red-400 text-xs font-mono"
                >
                  Remove
                </button>
              )}
            </div>
            {formData.avatar_url && (
              <div className="mt-2 text-[10px] text-neon-green font-mono">
                ✓ Avatar successfully attached
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (usernameStatus !== 'valid' && formData.username.length > 0)}
            className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-neon-green text-black rounded-lg text-sm font-semibold hover:bg-neon-green/90 transition-all shadow-[0_0_20px_rgba(8,255,8,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Finish Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
