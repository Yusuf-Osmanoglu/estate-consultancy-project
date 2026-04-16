<script setup lang="ts">
import { ref } from 'vue'
import { X, UserPlus } from 'lucide-vue-next'
import { useAgentsStore } from '~/stores/agents'

const emit = defineEmits<{
  close: []
}>()

const agentsStore = useAgentsStore()

const form = ref({
  name: '',
  email: '',
  phone: '',
})

const submitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!form.value.name || !form.value.email) {
    errorMessage.value = 'Name and email are required.'
    return
  }

  submitting.value = true
  try {
    await agentsStore.createAgent({
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone || undefined,
    })
    emit('close')
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Failed to create agent.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-modal-in">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserPlus class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-800">New Agent</h2>
            <p class="text-xs text-slate-400 mt-0.5">Register a new estate agent</p>
          </div>
        </div>
        <button @click="emit('close')" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <X class="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-5">

        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 font-medium">
          {{ errorMessage }}
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. Sarah Jenkins"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="e.g. sarah@estate.com"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone (Optional)</label>
          <input
            v-model="form.phone"
            type="tel"
            placeholder="e.g. +90 555 123 4567"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full py-3 bg-[#0F172A] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {{ submitting ? 'Creating...' : 'Add Agent' }}
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
