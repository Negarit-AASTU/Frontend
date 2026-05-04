import Link from 'next/link';
import { Home, Briefcase, User, Settings, HelpCircle, CreditCard } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function RecruiterSidebarLinks() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6 flex-1 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">Main Menu</h3>
          <nav className="space-y-1">
            <Link href="/recruiter" className="flex items-center space-x-3 text-indigo-600 bg-indigo-50 px-2 py-2 rounded-md font-medium text-sm">
              <Home size={18} />
              <span>Dashboard</span>
            </Link>
            <Link href="/recruiter/jobs" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-2 rounded-md font-medium text-sm">
              <Briefcase size={18} />
              <span>Jobs</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-2 rounded-md font-medium text-sm">
              <User size={18} />
              <span>Profile</span>
            </Link>
          </nav>
        </div>
        
        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">Settings & Support</h3>
          <nav className="space-y-1">
            <Link href="/recruiter/settings" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-2 rounded-md font-medium text-sm">
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-2 rounded-md font-medium text-sm">
              <CreditCard size={18} />
              <span>Subscription</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-2 rounded-md font-medium text-sm">
              <HelpCircle size={18} />
              <span>Help Center</span>
            </Link>
          </nav>
        </div>
      </div>

      <div className="px-4 pb-6 mt-auto">
        <div className="bg-[#4238b8] rounded-xl p-4 text-white text-center shadow-sm">
          <h4 className="font-bold text-sm mb-1">Become Pro Access</h4>
          <p className="text-xs text-indigo-200 mb-4 leading-tight">Try your experience for using more features</p>
          <Button className="w-full bg-white text-[#4238b8] hover:bg-gray-50 font-bold rounded-lg shadow-sm">
            Upgrade Pro
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RecruiterSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-4 flex items-center justify-between border-b border-transparent h-16">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Negarit" className="h-8 object-contain" />
          <span className="text-xl font-bold">Negarit</span>
        </div>
      </div>
      <RecruiterSidebarLinks />
    </aside>
  );
}
