const DemoLogout = () => {
    const handleLogin = () => {
      window.location.href = '/';
    };
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-12 border-b md:border-b-0 md:border-r border-[#1a1a1a]">
          <div className="animate-in fade-in slide-in-from-left duration-1000">
            <h1 className="text-7xl md:text-9xl font-bold text-white">
              Budgy<span className="text-emerald-500">.</span>
            </h1>
          </div>
        </div>
        <div className="w-full md:w-1/2 bg-app-bg flex items-center justify-center p-8 md:p-20">
          <div className="max-w-md w-full animate-in fade-in slide-in-from-right duration-1000">
            <div className="mb-10">
              <h2 className="text-3xl font-medium text-white mb-6">
                You have successfully logged out<span className="text-emerald-500">.</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Thanks for testing Budgy's <span className="text-white font-medium">'Demo Mode'</span>. Feel free to clone the <span className="text-white font-medium">'Budgy'</span> repository and create your own version. 
              </p>
            </div>
  
            <div className="space-y-6">
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-4 bg-[#1a1a1a] py-4 px-6 rounded-2xl font-semibold text-white hover:bg-[#222] hover:bg-emerald-500/50 transition-all duration-300 group shadow-2xl"
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-6 h-6 group-hover:scale-110 transition-transform" 
                />
                <span className="text-lg">Continue with Google</span>
              </button>
              <div className="flex items-center gap-3 pt-4">
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default DemoLogout;