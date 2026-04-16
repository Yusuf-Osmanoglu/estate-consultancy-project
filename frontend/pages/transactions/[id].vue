<script setup lang="ts">
import { ArrowLeft, Building2, User, DollarSign, FileText } from 'lucide-vue-next'
import { useTransactionsStore } from '~/stores/transactions'
import StageTransition from '~/components/StageTransition.vue'

const route = useRoute()
const transactionsStore = useTransactionsStore()

const id = route.params.id as string

useHead({
  title: 'Transaction Details | Digital Estate',
})

await transactionsStore.fetchTransaction(id)
await transactionsStore.fetchBreakdown(id)

const transaction = computed(() => transactionsStore.currentTransaction)
const breakdown = computed(() => transactionsStore.currentBreakdown)
const error = computed(() => transactionsStore.error)

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(val)

const handleStageUpdated = async (newStatus: string) => {
  // Re-fetch to get fresh data
  await transactionsStore.fetchTransaction(id)
  await transactionsStore.fetchBreakdown(id)
}
</script>

<template>
  <div class="space-y-8 animate-fade-in">

    <!-- Back button -->
    <div>
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group">
        <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Dashboard
      </NuxtLink>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
      <h3 class="font-bold text-lg mb-2">Transaction Not Found</h3>
      <p class="text-sm">{{ error }}</p>
    </div>

    <template v-else-if="transaction">
      
      <!-- Header -->
      <header>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 mb-1">{{ transaction.propertyAddress }}</h1>
        <p class="text-sm font-medium text-slate-500">
          Transaction ID: <span class="font-mono text-slate-400">{{ (transaction as any)._id }}</span>
        </p>
      </header>

      <!-- Stage Transition Card (Case 4.1 — Dashboard visualization) -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5">Transaction Lifecycle</h2>
        <StageTransition 
          :transaction-id="(transaction as any)._id"
          :current-status="transaction.status"
          @updated="handleStageUpdated"
        />
      </section>

      <!-- Financial Breakdown (Case 4.2) -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <!-- Agency Share -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Agency Share</h3>
              <p class="text-xs text-slate-400">50% of total fee</p>
            </div>
          </div>
          <div class="text-3xl font-extrabold text-slate-800">
            {{ breakdown ? formatCurrency(breakdown.breakdown.agency.amount) : '—' }}
          </div>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            {{ breakdown?.breakdown.agency.note || '' }}
          </p>
        </div>

        <!-- Listing Agent Share -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <User class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Listing Agent</h3>
              <p class="text-xs text-slate-500 font-semibold">{{ breakdown?.breakdown.listingAgent.name || '—' }}</p>
            </div>
          </div>
          <div class="text-3xl font-extrabold text-slate-800">
            {{ breakdown ? formatCurrency(breakdown.breakdown.listingAgent.amount) : '—' }}
          </div>
          <p class="text-xs mt-2 leading-relaxed">
            <span class="font-semibold text-emerald-600">{{ breakdown?.breakdown.listingAgent.percentage }}%</span>
            <span class="text-slate-400 ml-1">— {{ breakdown?.breakdown.listingAgent.role }}</span>
          </p>
        </div>

        <!-- Selling Agent Share -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <User class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Selling Agent</h3>
              <p class="text-xs text-slate-500 font-semibold">{{ breakdown?.breakdown.sellingAgent.name || '—' }}</p>
            </div>
          </div>
          <div class="text-3xl font-extrabold text-slate-800">
            {{ breakdown ? formatCurrency(breakdown.breakdown.sellingAgent.amount) : '—' }}
          </div>
          <p class="text-xs mt-2 leading-relaxed">
            <span class="font-semibold text-amber-600">{{ breakdown?.breakdown.sellingAgent.percentage }}%</span>
            <span class="text-slate-400 ml-1">— {{ breakdown?.breakdown.sellingAgent.role }}</span>
          </p>
        </div>

      </section>

      <!-- Summary Card -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Commission Summary</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-sm text-slate-500 font-medium">Total Service Fee</span>
              <span class="text-sm font-bold text-slate-800">{{ formatCurrency(transaction.totalServiceFee) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-sm text-slate-500 font-medium">Company Share (50%)</span>
              <span class="text-sm font-bold text-blue-700">{{ formatCurrency(transaction.companyShare) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-sm text-slate-500 font-medium">Listing Agent Share</span>
              <span class="text-sm font-bold text-emerald-600">{{ formatCurrency(transaction.listingAgentShare) }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-sm text-slate-500 font-medium">Selling Agent Share</span>
              <span class="text-sm font-bold text-amber-600">{{ formatCurrency(transaction.sellingAgentShare) }}</span>
            </div>
          </div>

          <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <div class="flex items-start gap-3">
              <FileText class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Commission Note</h4>
                <p class="text-sm text-slate-600 leading-relaxed">{{ transaction.commissionNote }}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

    </template>

    <!-- Loading State -->
    <div v-else class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

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
