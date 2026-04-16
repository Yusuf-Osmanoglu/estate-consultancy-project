<script setup lang="ts">
import { Check, ChevronRight } from 'lucide-vue-next'
import { useTransactionsStore } from '~/stores/transactions'

const props = defineProps<{
  transactionId: string
  currentStatus: string
}>()

const emit = defineEmits<{
  updated: [newStatus: string]
}>()

const transactionsStore = useTransactionsStore()

const stages = [
  { key: 'agreement', label: 'Agreement', icon: '📝' },
  { key: 'earnest_money', label: 'Earnest Money', icon: '💰' },
  { key: 'title_deed', label: 'Title Deed', icon: '📄' },
  { key: 'completed', label: 'Completed', icon: '✅' },
]

const currentIndex = computed(() =>
  stages.findIndex((s) => s.key === props.currentStatus)
)

const nextStage = computed(() => {
  const next = currentIndex.value + 1
  return next < stages.length ? stages[next] : null
})

const updating = ref(false)
const errorMsg = ref('')

const advanceStage = async () => {
  if (!nextStage.value) return
  updating.value = true
  errorMsg.value = ''
  try {
    await transactionsStore.updateStage(props.transactionId, nextStage.value.key)
    emit('updated', nextStage.value.key)
  } catch (err: any) {
    errorMsg.value = err?.data?.message || 'Failed to advance stage'
  } finally {
    updating.value = false
  }
}

const getStageState = (index: number) => {
  if (index < currentIndex.value) return 'completed'
  if (index === currentIndex.value) return 'current'
  return 'upcoming'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Stage Stepper -->
    <div class="flex items-center gap-1">
      <template v-for="(stage, index) in stages" :key="stage.key">
        <!-- Stage Dot -->
        <div class="flex flex-col items-center gap-1.5 min-w-0 flex-1">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0"
            :class="{
              'bg-emerald-500 text-white shadow-lg shadow-emerald-200': getStageState(index) === 'completed',
              'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-100': getStageState(index) === 'current',
              'bg-slate-100 text-slate-400': getStageState(index) === 'upcoming',
            }"
          >
            <Check v-if="getStageState(index) === 'completed'" class="w-5 h-5" />
            <span v-else>{{ stage.icon }}</span>
          </div>
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-center leading-tight"
            :class="{
              'text-emerald-600': getStageState(index) === 'completed',
              'text-blue-700': getStageState(index) === 'current',
              'text-slate-400': getStageState(index) === 'upcoming',
            }"
          >
            {{ stage.label }}
          </span>
        </div>

        <!-- Connector line -->
        <div
          v-if="index < stages.length - 1"
          class="h-0.5 flex-1 rounded-full mb-6 transition-all duration-300"
          :class="{
            'bg-emerald-400': index < currentIndex,
            'bg-blue-300': index === currentIndex,
            'bg-slate-200': index > currentIndex,
          }"
        />
      </template>
    </div>

    <!-- Error message -->
    <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2.5 font-medium">
      {{ errorMsg }}
    </div>

    <!-- Advance Button -->
    <div v-if="nextStage" class="pt-1">
      <button
        @click="advanceStage"
        :disabled="updating"
        class="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-200"
      >
        <span v-if="updating">Processing...</span>
        <template v-else>
          Advance to {{ nextStage.label }}
          <ChevronRight class="w-4 h-4" />
        </template>
      </button>
    </div>

    <!-- Completed Badge -->
    <div v-else class="text-center py-2">
      <span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
        <Check class="w-4 h-4" />
        Transaction Completed
      </span>
    </div>
  </div>
</template>
