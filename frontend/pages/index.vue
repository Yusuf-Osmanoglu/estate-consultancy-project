<script setup lang="ts">
import { Wallet, Building, ArrowUpRight, Plus, TrendingUp } from 'lucide-vue-next'
import { useTransactionsStore } from '~/stores/transactions'
import KpiCard from '~/components/KpiCard.vue'
import TransactionTable from '~/components/TransactionTable.vue'

useHead({
  title: 'Dashboard | Digital Estate',
})

const transactionsStore = useTransactionsStore()

// Veriyi çek (Pinia Store üzerinden)
await transactionsStore.fetchTransactions()
await transactionsStore.fetchStats()

const transactions = computed(() => transactionsStore.transactions)
const stats = computed(() => transactionsStore.stats)
const loading = computed(() => transactionsStore.loading)

// Modal state
const showCreateModal = ref(false)

const handleTransactionCreated = () => {
  showCreateModal.value = false
}
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Page Header -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 mb-1">Financial Transactions</h1>
        <p class="text-sm font-medium text-slate-500">Detailed overview of residential and commercial commission disbursements.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
      >
        <Plus class="w-4 h-4" />
        New Transaction
      </button>
    </header>

    <!-- Top KPI Cards — Dinamik veriler -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KpiCard 
        title="Total Revenue" 
        :value="stats ? transactionsStore.formattedTotalRevenue : '—'" 
        :trend="stats && stats.totalDeals > 0 ? `${stats.totalDeals} total deals` : ''" 
        :icon="Wallet" 
        iconBgColor="bg-indigo-50 text-indigo-500" 
      />
      <KpiCard 
        title="Net Company Profit" 
        :value="stats ? transactionsStore.formattedCompanyProfit : '—'" 
        subtitle="50% margin per company policy" 
        :icon="Building" 
        iconBgColor="bg-emerald-50 text-emerald-500" 
      />
      <KpiCard 
        title="Deal Status" 
        :value="stats ? `${stats.completedDeals} / ${stats.totalDeals}` : '—'" 
        :subtitle="stats ? `${stats.pendingDeals} pending closing` : ''" 
        :icon="ArrowUpRight" 
        iconBgColor="bg-blue-50 text-blue-500" 
      />
    </section>

    <!-- Ledger Table -->
    <section>
      <TransactionTable :transactions="transactions" :loading="loading" />
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

      <!-- Completed Ratio -->
      <div class="bg-[#0F172A] rounded-xl p-8 flex flex-col justify-between text-white shadow-lg relative overflow-hidden">
        <div class="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div class="relative z-10">
          <div class="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold mb-2">Completion Rate</h3>
          <p class="text-xs text-slate-400 leading-relaxed font-medium">
            <span class="text-white font-bold">{{ stats?.completedDeals || 0 }}</span> out of <span class="text-white font-bold">{{ stats?.totalDeals || 0 }}</span> transactions have reached completion stage.
          </p>
        </div>
        
        <div class="mt-8 relative z-10">
          <div class="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              class="h-full bg-emerald-400 rounded-full transition-all duration-700" 
              :style="{ width: stats && stats.totalDeals > 0 ? `${(stats.completedDeals / stats.totalDeals * 100)}%` : '0%' }"
            ></div>
          </div>
          <div class="flex justify-between items-center mt-2 text-[10px] font-bold text-slate-400 tracking-wider">
            <span>COMPLETION</span>
            <span>{{ stats && stats.totalDeals > 0 ? Math.round(stats.completedDeals / stats.totalDeals * 100) : 0 }}%</span>
          </div>
        </div>
      </div>
      
    </section>

    <!-- Create Transaction Modal -->
    <CreateTransactionModal v-if="showCreateModal" @close="handleTransactionCreated" />

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
