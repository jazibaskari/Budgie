const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white shadow-2xl rounded-3xl text-center">
        <h1 className="text-4xl font-black text-blue-600 mb-4">Budgie</h1>
        <p className="text-slate-500 mb-8">Take control of your finances with AI.</p>
        
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 py-3 px-4 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;