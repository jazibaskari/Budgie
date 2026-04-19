export default function MiniCalendar() {
    const now = new Date();
    
    const dateNum = now.getDate().toString().padStart(2, '0');
    const monthNum = (now.getMonth() + 1).toString().padStart(2, '0'); 
    
    const displayDate = now.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  
    return (
      <div className="flex items-center justify-end w-55 h-55">
        <div className="aspect-square h-full bg-[#161616] rounded-full flex items-center justify-center p-4 transition-all hover:bg-[#1a1a1a] shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-2 items-center justify-items-center w-full max-w-[180px] mb-2">
              <div className="ml-7">
                <span className="text-white text-7xl font-regular leading-none">
                  {dateNum} 
                </span>
              </div>
              <div className="mr-7">
                <span className="text-emerald-500 text-7xl font-regular leading-none">
                  {monthNum}
                </span>
              </div>
            </div>
            <p className="text-gray-500 font-regular text-sm leading-relaxed max-w-md">
              {displayDate}
            </p>
  
          </div>
        </div>
      </div>
    );
  }