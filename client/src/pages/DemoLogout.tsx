const DemoLogout = () => {
    const handleLogin = () => {
      window.location.href = '/';
    };
    return (
      <div className="h-screen flex flex-col md:flex-row overflow-hidden">
        <div className="h-[40%] w-full md:h-full md:w-1/2 bg-black flex items-center justify-center p-8 md:p-12 border-b md:border-b-0 md:border-r border-[#1a1a1a]">
          <div className="animate-in fade-in slide-in-from-left duration-1000 text-center">
            <h1 className="text-6xl sm:text-7xl md:text-9xl font-bold text-white">
              Budgy<span className="text-emerald-500">.</span>
            </h1>
          </div>
        </div>
        <div className="h-[60%] w-full md:h-full md:w-1/2 bg-app-bg flex items-center justify-center p-6 sm:p-8 md:p-20 overflow-y-auto">
          <div className="max-w-[260px] md:max-w-md w-full animate-in fade-in slide-in-from-right duration-1000">
            <div className="mb-8 md:mb-10">
              <h2 className="text-2xl sm:text-3xl font-medium text-white mb-4 md:mb-6">
                You have successfully logged out<span className="text-emerald-500">.</span>
              </h2>
              <p className="text-gray-400 text-sm sm:text-lg leading-relaxed mb-6 md:mb-8 whitespace-normal break-words">
                Thanks for testing Budgy's <span className="text-white font-regular">'Demo Mode'</span>. Feel free to clone the repository and create your own version. 
              </p>
            </div>
  
            <div className="space-y-4 md:space-y-6">
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-4 bg-[#1a1a1a] py-3.5 md:py-4 px-6 rounded-2xl font-semibold text-white hover:bg-[#222] hover:bg-emerald-500/50 transition-all duration-300 group shadow-2xl"
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" 
                />
                <span className="text-base sm:text-lg">Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default DemoLogout;