<script setup lang="ts">
import { 
  Building2, 
  LayoutDashboard, 
  BriefcaseBusiness, 
  Users, 
  Search,
  Bell,
  Mail
} from 'lucide-vue-next';
</script>

<template>
  <div class="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans">
    
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col pt-6 pb-4 shrink-0 transition-all z-10 sticky top-0 h-screen overflow-y-auto hidden md:flex">
      
      <!-- Brand Logo -->
      <div class="px-6 mb-10 flex gap-3 items-center">
        <div class="w-8 h-8 rounded-md bg-blue-900 border border-blue-800 text-white flex items-center justify-center p-1.5 shadow-sm">
          <Building2 class="w-full h-full" stroke-width="2.5" />
        </div>
        <div>
          <h1 class="text-sm font-bold tracking-wide text-slate-900 uppercase">Digital Estate</h1>
          <p class="text-[10px] uppercase text-slate-400 tracking-wider">Management Suite</p>
        </div>
      </div>
      
      <!-- Navigation Menu -->
      <nav class="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <NuxtLink 
          to="/" 
          class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors"
          :class="$route.path === '/' ? 'bg-[#F0F4FF] text-blue-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'"
        >
          <div v-if="$route.path === '/'" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-700 rounded-r-md"></div>
          <LayoutDashboard class="w-4 h-4" />
          Dashboard
        </NuxtLink>
        <NuxtLink 
          to="/transactions" 
          class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors relative"
          :class="$route.path.startsWith('/transactions') ? 'bg-[#F0F4FF] text-blue-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'"
        >
          <div v-if="$route.path.startsWith('/transactions')" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-700 rounded-r-md"></div>
          <BriefcaseBusiness class="w-4 h-4" />
          Transactions
        </NuxtLink>
        <NuxtLink 
          to="/agents" 
          class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors relative"
          :class="$route.path === '/agents' ? 'bg-[#F0F4FF] text-blue-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'"
        >
          <div v-if="$route.path === '/agents'" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-700 rounded-r-md"></div>
          <Users class="w-4 h-4" />
          Agents
        </NuxtLink>
      </nav>
      
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      
      <!-- Top Header -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 shadow-sm">
        
        <!-- Global Search -->
        <div class="flex-1 max-w-xl">
          <div class="relative group">
            <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search transactions, properties, or agents..." 
              class="w-full bg-[#F4F7FB] border border-transparent text-sm text-slate-700 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100/50 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
        
        <!-- Header Actions & Profile -->
        <div class="flex items-center gap-5 pl-4 ml-4 border-l border-slate-200 h-8">
          <div class="flex gap-1">
            <button class="relative p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
              <Bell class="w-5 h-5" />
            </button>
            <button class="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <Mail class="w-5 h-5" />
            </button>
          </div>
          
          <div class="flex items-center gap-3 pl-3">
            <div class="text-right hidden sm:block">
              <div class="text-sm font-semibold text-slate-800">Alex Sterling</div>
              <div class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Portfolio Director</div>
            </div>
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=f1f5f9" 
              alt="Alex Sterling" 
              class="w-8 h-8 rounded-full border border-slate-200 shadow-sm bg-slate-50"
            />
          </div>
        </div>

      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10 bg-[#F8FAFC]">
        <div class="max-w-6xl mx-auto w-full">
          <slot />
        </div>
      </main>

    </div>
  </div>
</template>

<style>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

.nav-link {
  position: relative;
}
</style>
