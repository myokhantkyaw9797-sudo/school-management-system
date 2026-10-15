import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../auth/api/AuthApi';
import { useAuthStore } from '../auth/store/useAuthStore';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await loginApi({ username, password });
      
      const roles: string[] = response.roles || [];
      
      // Roles Array ထဲတွင် PRINCIPAL သို့မဟုတ် TEACHER ပါမပါ စစ်ဆေးခြင်း
      const isPrincipal = roles.some((r) => r.toUpperCase().includes('PRINCIPAL'));
      const isTeacher = roles.some((r) => r.toUpperCase().includes('TEACHER'));

      // Store ထဲသို့ Role သိမ်းဆည်းခြင်း
      const primaryRole = isPrincipal 
        ? 'ROLE_PRINCIPAL' 
        : isTeacher 
        ? 'ROLE_TEACHER' 
        : (roles[0] || '');
      
      login(response.token, response.username, primaryRole);

      // Dashboard များသို့ လမ်းကြောင်းညွှန်ခြင်း
      if (isPrincipal) {
        navigate('/principal/dashboard');
      } else if (isTeacher) {
        navigate('/teacher/dashboard');
      } else {
        navigate('/unauthorized');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Username သို့မဟုတ် Password မှားယွင်းနေပါသည်။');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-emerald-100 p-8">
        <div className="text-center mb-6">
          <img 
            src="http://localhost:8080/images/other/EducationFlag%20.png" 
            alt="Myanmar Education Emblem" 
            className="w-20 h-20 mx-auto mb-3 object-contain"
          />
          <h2 className="text-2xl font-bold text-emerald-900">ကျောင်းစီမံခန့်ခွဲမှုစနစ်</h2>
          <p className="text-sm text-gray-600 mt-1">စနစ်ထဲသို့ ဝင်ရောက်ရန် အကောင့်အချက်အလက် ဖြည့်ပါ</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-sm rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              အသုံးပြုသူအမည် (Username)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Username ရိုက်ထည့်ပါ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              စကားဝှက် (Password)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-lg transition duration-200 shadow-md disabled:bg-emerald-300"
          >
            {loading ? 'ဝင်ရောက်နေသည်...' : 'ဝင်ရောက်မည် (Login)'}
          </button>
        </form>
      </div>
    </div>
  );
};