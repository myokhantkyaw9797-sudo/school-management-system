import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import type { DecodedToken } from '../dto/DecodedToken';

interface AuthState {
  token: string | null;
  username: string | null;
  role: string | null;
  fullName: string | null;
  position: string | null;
  isAuthenticated: boolean;
  login: (token: string, username: string, role: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  username: localStorage.getItem('username'),
  role: localStorage.getItem('role'),
  fullName: localStorage.getItem('fullName'),
  position: localStorage.getItem('position'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: (token, username, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    set({ token, username, role, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    set({ token: null, username: null, role: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    if (!token) {
      set({ isAuthenticated: false, token: null, username: null, role: null });
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Token သက်တမ်းကုန်/မကုန် စစ်ဆေးခြင်း
      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        set({ isAuthenticated: false, token: null, username: null, role: null });
      } else {
        // LocalStorage ထဲရှိ တန်ဖိုးများကို Store State ထဲသို့ ပြန်လည် Sync လုပ်ပေးခြင်း
        set({
          token,
          role,
          username,
          isAuthenticated: true,
        });
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      set({ isAuthenticated: false, token: null, username: null, role: null });
    }
  },
}));