
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isResetMode) {
        // Handle password reset request
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage('密碼重設連結已發送至您的電子郵件。');
      } else {
        // Handle login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        navigate('/');
      }
    } catch (error: any) {
      setError(error.message || (isResetMode ? '發送重設郵件失敗。' : '登入失敗，請檢查您的帳號密碼。'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
          {isResetMode ? '重設密碼' : '歡迎回來'}
        </h1>
        
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

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
          
          {!isResetMode && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">密碼</label>
                <button
                  type="button"
                  onClick={() => { setIsResetMode(true); setError(null); setMessage(null); }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  忘記密碼？
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-900 text-white py-2 rounded-md font-medium hover:bg-blue-800 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? '處理中...' : (isResetMode ? '發送重設連結' : '登入')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 flex flex-col space-y-2">
          {isResetMode && (
            <button
              onClick={() => { setIsResetMode(false); setError(null); setMessage(null); }}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              返回登入
            </button>
          )}
          <div>
            還沒有帳號？{' '}
            <Link to="/register" className="text-orange-600 hover:text-orange-700 font-medium">
              立即註冊
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
