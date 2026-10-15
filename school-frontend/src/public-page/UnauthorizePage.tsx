import React from 'react';
import { Link } from 'react-router-dom';

export const UnauthorizePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
      <div className="text-center bg-white p-8 rounded-xl shadow-md border border-emerald-100 max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-red-600 mb-2">403</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-2">ဝင်ရောက်ခွင့်မရှိပါ</h2>
        <p className="text-gray-600 text-sm mb-6">
          ဒီစာမျက်နှာကို ကြည့်ရှုရန် သင့်ထံတွင် ခွင့်ပြုချက် (Permission) မရှိပါ။
        </p>
        <Link
          to="/"
          className="inline-block bg-emerald-700 text-white font-medium px-5 py-2 rounded-lg hover:bg-emerald-800 transition"
        >
          ပင်မစာမျက်နှာသို့ ပြန်သွားမည်
        </Link>
      </div>
    </div>
  );
};