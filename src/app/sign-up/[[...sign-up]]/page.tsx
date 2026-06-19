import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020817] to-[#0a101f] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md p-4 mt-12 mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
            Harsh<span className="text-emerald-400">Bank</span>
          </h1>
          <p className="text-gray-400 font-medium">Create Secure Identity</p>
        </div>

        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-2xl",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
