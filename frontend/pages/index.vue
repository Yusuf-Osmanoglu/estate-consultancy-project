<script setup lang="ts">
import { computed } from 'vue'
import { Wallet, Building, ArrowUpRight, TrendingUp } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import KpiCard from '~/components/KpiCard.vue'
import TransactionTable from '~/components/TransactionTable.vue'

// Page metadata
useHead({
  title: 'Financial Transactions | Digital Estate',
})

// Fetch data
const { fetcher } = useApi()

// We assume the API returns { data: Transaction[], total: number } or similar
// For this example, let's say it just returns Transaction[] directly
const { data: transactionsData, pending, error } = await fetcher<any>('/transactions')

// We process the data to ensure default properties
const transactions = computed(() => {
  // Eğer henüz veri yükleniyorsa veya hata varsa/veri yoksa boş array dön
  if (pending.value || !transactionsData.value) return []
  
  // API array döndürüyorsa veya obje içerisindeki bir array alanındaysa (örn: res.data)
  const rawData = Array.isArray(transactionsData.value) 
    ? transactionsData.value 
    : (transactionsData.value.data || [])

  // Validasyon: Gerçekten maplenebilecek bir array geldiğinden emin ol
  if (!Array.isArray(rawData)) return []

  return rawData.map((t: any) => ({
    ...t,
    // Provide sensible defaults for the UI demo based on the mock screenshot
    status: t.status || 'completed',
    commissionNote: t.commissionNote || 'Standard 50/50 broker split applied as per agreement.'
  }))
})
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Page Header -->
    <header>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 mb-1">Financial Transactions</h1>
      <p class="text-sm font-medium text-slate-500">Detailed overview of residential and commercial commission disbursements.</p>
    </header>

    <!-- Top KPI Cards -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Revenue -->
      <KpiCard 
        title="Total Revenue" 
        value="$4,280,450" 
        trend="+12.4% vs last quarter" 
        :icon="Wallet" 
        iconBgColor="bg-indigo-50 text-indigo-500" 
      />
      <!-- Net Company Profit -->
      <KpiCard 
        title="Net Company Profit" 
        value="$241,250" 
        subtitle="50% Margin fully reconciled" 
        :icon="Building" 
        iconBgColor="bg-emerald-50 text-emerald-500" 
      />
      <!-- Total Deals -->
      <KpiCard 
        title="Total Deals" 
        value="142" 
        subtitle="24 pending closing" 
        :icon="ArrowUpRight" 
        iconBgColor="bg-blue-50 text-blue-500" 
      />
    </section>

    <!-- Ledger Table -->
    <section>
      <TransactionTable :transactions="transactions" :loading="pending" />
    </section>

    <!-- Bottom Section: Growth Projection & Agent Performance -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Growth Projection -->
      <div class="lg:col-span-2 bg-[#F0F4FF] rounded-xl p-8 border border-blue-100 flex flex-col justify-center">
        <h3 class="text-xl font-bold text-slate-900 mb-4">Financial Growth Projection</h3>
        <p class="text-slate-600 text-sm leading-relaxed mb-6 max-w-lg font-medium">
          Based on current pending deals, the company is on track to exceed its annual revenue target by <span class="font-bold text-emerald-600">18%</span>. Reinvestments are recommended for the Q4 expansion phase.
        </p>
        <div>
          <button class="text-sm font-bold text-blue-700 hover:text-blue-800 flex items-center gap-2 group transition-colors">
            View detailed forecasting 
            <TrendingUp class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <!-- Agent Performance -->
      <div class="bg-[#0F172A] rounded-xl p-8 flex flex-col justify-between text-white shadow-lg relative overflow-hidden">
        <div class="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div class="relative z-10">
          <div class="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold mb-2">Agent Performance</h3>
          <p class="text-xs text-slate-400 leading-relaxed font-medium">
            Sarah Jenkins has reached her <span class="text-white font-bold">Platinum Tier</span> bonus threshold this month.
          </p>
        </div>
        
        <div class="mt-8 relative z-10">
          <div class="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-400 rounded-full" style="width: 82%"></div>
          </div>
          <div class="flex justify-between items-center mt-2 text-[10px] font-bold text-slate-400 tracking-wider">
            <span>PROGRESS</span>
            <span>82%</span>
          </div>
        </div>
      </div>
      
    </section>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
