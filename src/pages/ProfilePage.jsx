import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabaseService from '../services/supabaseService';
import { toast } from 'react-hot-toast';
import { User, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, profile, completeProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    about: '',
    avatar_url: ''
  });

  const [usernameStatus, setUsernameStatus] = useState('valid'); // idle, checking, valid, invalid
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-sm text-white/50 mt-2">Sign in to create and edit your profile.</p>
          <Link
            to="/login"
            className="inline-flex mt-5 px-4 py-2 text-xs font-mono text-neon-green border border-neon-green/20 rounded hover:bg-neon-green/10 transition-colors"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (user && profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || user?.user_metadata?.full_name || '',
        about: profile.about || '',
        avatar_url: profile.avatar_url || user?.user_metadata?.avatar_url || ''
      });
      setUsernameStatus('valid');
    }
  }, [user, profile]);

  const checkUsername = async (val) => {
    if (val === profile?.username) {
      setUsernameStatus('valid');
      return;
    }
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
    if (val === profile?.username) {
      setUsernameStatus('valid');
    } else {
      setUsernameStatus('idle'); // Reset until blur or typing pause
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameStatus === 'invalid') {
      toast.error('Please choose a valid & unique username.');
      return;
    }

    setLoading(true);
    try {
      const isUnique = await supabaseService.checkUsernameUnique(formData.username, user.id);
      if (!isUnique) {
        setUsernameStatus('invalid');
        toast.error('Username is taken.');
        setLoading(false);
        return;
      }

      await supabaseService.upsertProfile(user.id, formData);
      completeProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Your Profile</h1>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
        
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
          {formData.avatar_url ? (
            <img src={formData.avatar_url} alt="" className="w-20 h-20 rounded-full border border-neon-green/20 object-cover" />
          ) : (
            <div className="w-20 h-20 bg-neon-green/10 rounded-full flex items-center justify-center border border-neon-green/20">
              <User className="text-neon-green" size={32} />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">{formData.full_name || 'My Profile'}</h2>
            <p className="font-mono text-neon-green text-sm mt-1">@{formData.username}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-mono text-white/50 uppercase flex justify-between">
                <span>Username *</span>
                {usernameStatus === 'checking' && <span className="text-yellow-400">Checking...</span>}
                {usernameStatus === 'valid' && <span className="text-neon-green flex items-center gap-1"><CheckCircle size={12} /> Available</span>}
                {usernameStatus === 'invalid' && <span className="text-red-400 flex items-center gap-1"><AlertCircle size={12} /> Taken</span>}
              </label>
              <input
                required
                value={formData.username}
                onChange={handleUsernameChange}
                onBlur={(e) => checkUsername(e.target.value)}
                className={`w-full bg-black/40 border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                  usernameStatus === 'invalid' ? 'border-red-500/50 focus:border-red-500' : 
                  usernameStatus === 'valid' ? 'border-neon-green/50 focus:border-neon-green' : 
                  'border-white/10 focus:border-neon-green/50'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-white/50 uppercase">Full Name *</label>
              <input
                required
                value={formData.full_name}
                onChange={(e) => setFormData(p => ({...p, full_name: e.target.value}))}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-green/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-white/50 uppercase">About Me</label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData(p => ({...p, about: e.target.value}))}
              rows={3}
              placeholder="Tell others about yourself..."
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-green/50 resize-y"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-white/50 uppercase block mb-2">Profile Picture</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm text-white transition-colors duration-200">
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
                      // Auto-save avatar to profile immediately
                      await supabaseService.upsertProfile(user.id, { avatar_url: url });
                      completeProfile({ ...profile, avatar_url: url });
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
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading || usernameStatus === 'invalid'}
              className="flex items-center gap-2 px-6 py-2.5 bg-neon-green text-black rounded-lg text-sm font-semibold hover:bg-neon-green/90 transition-all shadow-[0_0_15px_rgba(8,255,8,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
