<script setup lang="ts">
import { Users, Plus, Mail, Phone } from 'lucide-vue-next'
import { useAgentsStore } from '~/stores/agents'

useHead({
  title: 'Agents | Digital Estate',
})

const agentsStore = useAgentsStore()
await agentsStore.fetchAgents()

const agents = computed(() => agentsStore.agents)
const loading = computed(() => agentsStore.loading)

const showCreateModal = ref(false)

const handleAgentCreated = () => {
  showCreateModal.value = false
}
</script>

<template>
  <div class="space-y-8 animate-fade-in">

    <!-- Page Header -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 mb-1">Agents</h1>
        <p class="text-sm font-medium text-slate-500">Manage your estate agents and consultants.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
      >
        <Plus class="w-4 h-4" />
        Add Agent
      </button>
    </header>

    <!-- Stats -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
        <Users class="w-6 h-6" />
      </div>
      <div>
        <div class="text-2xl font-extrabold text-slate-800">{{ agents.length }}</div>
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Agents</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="agents.length === 0" class="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
      <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Users class="w-8 h-8 text-slate-300" />
      </div>
      <h3 class="text-sm font-bold text-slate-600 mb-1">No agents yet</h3>
      <p class="text-xs text-slate-400 mb-4">Add your first agent to get started.</p>
      <button
        @click="showCreateModal = true"
        class="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
      >
        Add Agent
      </button>
    </div>

    <!-- Agent Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="agent in agents"
        :key="agent._id"
        class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all group"
      >
        <div class="flex items-start gap-4">
          <img
            :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}&backgroundColor=e2e8f0`"
            :alt="agent.name"
            class="w-14 h-14 rounded-full border-2 border-slate-100 shadow-sm"
          />
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
              {{ agent.name }}
            </h3>
            <div class="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400 font-medium">
              <Mail class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">{{ agent.email }}</span>
            </div>
            <div v-if="agent.phone" class="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-medium">
              <Phone class="w-3.5 h-3.5 shrink-0" />
              <span>{{ agent.phone }}</span>
            </div>
          </div>
        </div>

        <!-- Agent ID badge -->
        <div class="mt-4 pt-4 border-t border-slate-50">
          <div class="text-[10px] font-mono text-slate-300 truncate">
            ID: {{ agent._id }}
          </div>
        </div>
      </div>
    </div>

    <!-- Create Agent Modal -->
    <CreateAgentModal v-if="showCreateModal" @close="handleAgentCreated" />

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
