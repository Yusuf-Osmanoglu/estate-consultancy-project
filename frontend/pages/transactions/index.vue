<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { useTransactionsStore } from '~/stores/transactions'
import TransactionTable from '~/components/TransactionTable.vue'

useHead({
  title: 'All Transactions | Digital Estate',
})

const transactionsStore = useTransactionsStore()
await transactionsStore.fetchTransactions()

const transactions = computed(() => transactionsStore.transactions)
const loading = computed(() => transactionsStore.loading)

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
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 mb-1">All Transactions</h1>
        <p class="text-sm font-medium text-slate-500">Full list of all property transactions and their current stages.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
      >
        <Plus class="w-4 h-4" />
        New Transaction
      </button>
    </header>

    <!-- Transaction Table -->
    <TransactionTable :transactions="transactions" :loading="loading" />

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
