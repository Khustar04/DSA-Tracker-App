import { useState, useEffect } from 'react';
import supabaseService from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';
import { Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FriendRequestList({ onUpdate }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    const data = await supabaseService.getFriendRequests(user.id);
    setRequests(data);
  };

  const handleProcess = async (id, status) => {
    await supabaseService.handleFriendRequest(id, status);
    setRequests(requests.filter(r => r.id !== id));
    toast.success(`Friend request ${status}`);
    if (status === 'accepted') {
      onUpdate();
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-semibold text-white/80 mb-3">Pending Friend Requests</h3>
      <div className="space-y-2">
        {requests.map(req => (
          <div key={req.id} className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
            <div className="flex items-center gap-3">
              {req.requester.avatar_url ? (
                <img src={req.requester.avatar_url} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center text-neon-green font-bold text-xs">
                  {req.requester.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-white/90 font-mono">@{req.requester.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleProcess(req.id, 'accepted')} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded">
                <Check size={16} />
              </button>
              <button onClick={() => handleProcess(req.id, 'rejected')} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded">
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
