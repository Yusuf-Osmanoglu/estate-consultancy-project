<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useAgentsStore } from '~/stores/agents'
import { useTransactionsStore } from '~/stores/transactions'

const emit = defineEmits<{
  close: []
}>()

const agentsStore = useAgentsStore()
const transactionsStore = useTransactionsStore()

// Load agents for the dropdown
if (agentsStore.agents.length === 0) {
  await agentsStore.fetchAgents()
}

const form = ref({
  propertyAddress: '',
  totalServiceFee: 0,
  listingAgent: '',
  sellingAgent: '',
})

const submitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!form.value.propertyAddress || !form.value.listingAgent || !form.value.sellingAgent) {
    errorMessage.value = 'Please fill in all required fields.'
    return
  }
  if (form.value.totalServiceFee <= 0) {
    errorMessage.value = 'Total service fee must be greater than 0.'
    return
  }

  submitting.value = true
  try {
    await transactionsStore.createTransaction({
      propertyAddress: form.value.propertyAddress,
      totalServiceFee: form.value.totalServiceFee,
      listingAgent: form.value.listingAgent,
      sellingAgent: form.value.sellingAgent,
    })
    emit('close')
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Failed to create transaction.'
  } finally {
    submitting.value = false
  }
}

const isSameAgent = computed(() => {
  return (
    form.value.listingAgent &&
    form.value.sellingAgent &&
    form.value.listingAgent === form.value.sellingAgent
  )
})

const previewCompany = computed(() => form.value.totalServiceFee * 0.5)
const previewListing = computed(() =>
  isSameAgent.value
    ? form.value.totalServiceFee * 0.5
    : form.value.totalServiceFee * 0.25
)
const previewSelling = computed(() =>
  isSameAgent.value ? 0 : form.value.totalServiceFee * 0.25
)

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(val)
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal-in">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-100">
        <div>
          <h2 class="text-lg font-bold text-slate-800">New Transaction</h2>
          <p class="text-xs text-slate-400 mt-0.5">Create a new property transaction record</p>
        </div>
        <button @click="emit('close')" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <X class="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-5">

        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 font-medium">
          {{ errorMessage }}
        </div>

        <!-- Property Address -->
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Property Address *</label>
          <input
            v-model="form.propertyAddress"
            type="text"
            placeholder="e.g. 123 Main St, Istanbul"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400"
          />
        </div>

        <!-- Total Service Fee -->
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Total Service Fee (USD) *</label>
          <input
            v-model.number="form.totalServiceFee"
            type="number"
            min="0"
            step="100"
            placeholder="0"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400"
          />
        </div>

        <!-- Listing Agent -->
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Listing Agent *</label>
          <select
            v-model="form.listingAgent"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
          >
            <option value="" disabled>Select listing agent</option>
            <option v-for="agent in agentsStore.agents" :key="agent._id" :value="agent._id">
              {{ agent.name }} ({{ agent.email }})
            </option>
          </select>
        </div>

        <!-- Selling Agent -->
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Selling Agent *</label>
          <select
            v-model="form.sellingAgent"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
          >
            <option value="" disabled>Select selling agent</option>
            <option v-for="agent in agentsStore.agents" :key="agent._id" :value="agent._id">
              {{ agent.name }} ({{ agent.email }})
            </option>
          </select>
        </div>

        <!-- Same agent indicator -->
        <div v-if="isSameAgent" class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs font-medium text-amber-700">
          ⚡ Same agent selected — this agent will receive 100% of the agent share (50% of total fee).
        </div>

        <!-- Commission Preview -->
        <div v-if="form.totalServiceFee > 0" class="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Commission Preview</h4>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-600 font-medium">Agency (50%)</span>
              <span class="font-bold text-slate-800">{{ formatCurrency(previewCompany) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-600 font-medium">Listing Agent ({{ isSameAgent ? '50%' : '25%' }})</span>
              <span class="font-bold text-slate-800">{{ formatCurrency(previewListing) }}</span>
            </div>
            <div v-if="!isSameAgent" class="flex justify-between text-sm">
              <span class="text-slate-600 font-medium">Selling Agent (25%)</span>
              <span class="font-bold text-slate-800">{{ formatCurrency(previewSelling) }}</span>
            </div>
            <div class="border-t border-slate-200 pt-2 mt-2 flex justify-between text-sm">
              <span class="text-slate-800 font-bold">Total</span>
              <span class="font-bold text-blue-700">{{ formatCurrency(form.totalServiceFee) }}</span>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="submitting"
          class="w-full py-3 bg-[#0F172A] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {{ submitting ? 'Creating...' : 'Create Transaction' }}
        </button>

      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-modal-in {
  animation: modalIn 0.25s ease-out;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
