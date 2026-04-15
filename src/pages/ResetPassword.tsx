import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user is here with a valid recovery token
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Ready to reset password
      } else if (!session) {
        // If not authenticated and no recovery event, redirect to login
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    if (password.length < 6) {
      setError('密碼長度必須至少為 6 個字元');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setMessage('密碼重設成功！即將為您導向登入頁面...');
      
      // Clear session to force user to login with new password
      await supabase.auth.signOut();
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      setError(error.message || '密碼重設失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">設定新密碼</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新密碼</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="最少 6 個字元"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">確認新密碼</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="再次輸入新密碼"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!message}
            className={`w-full bg-blue-900 text-white py-2 rounded-md font-medium hover:bg-blue-800 transition-colors ${(loading || !!message) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? '處理中...' : '確認重設'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
