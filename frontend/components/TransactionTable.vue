<script setup lang="ts">
import { computed } from 'vue';
import { Info, Download, Filter } from 'lucide-vue-next';

interface Agent {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Transaction {
  _id: string;
  propertyAddress: string;
  totalServiceFee: number;
  listingAgent: Agent;
  sellingAgent: Agent;
  companyShare: number;
  listingAgentShare: number;
  sellingAgentShare: number;
  commissionNote?: string;
  status: 'completed' | 'pending' | 'hold';
}

const props = defineProps<{
  transactions: Transaction[];
  loading?: boolean;
}>();

const formatCurrency = (value: number, currency: 'USD' | 'TRY' = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'bg-emerald-100 text-emerald-700';
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'hold': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    
    <!-- Table Header -->
    <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
      <h2 class="text-lg font-bold text-slate-800">Recent Ledger Activity</h2>
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
          <Filter class="w-4 h-4" />
          Filter
        </button>
        <button class="px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
          <Download class="w-4 h-4" />
          Export CSV
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-12 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-[#F8FAFC] border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <th class="px-6 py-4">Property Address</th>
            <th class="px-6 py-4">Listing Agent</th>
            <th class="px-6 py-4">Selling Agent</th>
            <th class="px-6 py-4 text-right">Total Fee</th>
            <th class="px-6 py-4 text-right">
              Company
              <span class="block text-[9px] font-medium text-slate-300 mt-0.5">(50%)</span>
            </th>
            <th class="px-6 py-4 text-right">Agent Split</th>
            <th class="px-6 py-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="t in transactions" :key="t._id" class="hover:bg-slate-50/50 transition-colors group">
            
            <!-- Address -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-1 h-8 rounded-full" 
                     :class="t.status === 'completed' ? 'bg-emerald-500' : (t.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500')">
                </div>
                <div>
                  <div class="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{{ t.propertyAddress.split(',')[0] }}</div>
                  <div class="text-xs text-slate-400">{{ t.propertyAddress.split(',')[1]?.trim() || t.propertyAddress }}</div>
                </div>
              </div>
            </td>
            
            <!-- Listing Agent -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img :src="t.listingAgent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.listingAgent.name}&backgroundColor=e2e8f0`" 
                     class="w-8 h-8 rounded-full shadow-sm border border-slate-200" 
                     :alt="t.listingAgent.name" />
                <div class="text-sm font-semibold text-slate-700">{{ t.listingAgent.name }}</div>
              </div>
            </td>
            
            <!-- Selling Agent -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img :src="t.sellingAgent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.sellingAgent.name}&backgroundColor=e2e8f0`" 
                     class="w-8 h-8 rounded-full shadow-sm border border-slate-200" 
                     :alt="t.sellingAgent.name" />
                <div class="text-sm font-semibold text-slate-700">{{ t.sellingAgent.name }}</div>
              </div>
            </td>

            <!-- Total Fee -->
            <td class="px-6 py-4 text-right">
              <div class="text-sm font-bold text-slate-800">{{ formatCurrency(t.totalServiceFee) }}</div>
            </td>

            <!-- Company Share -->
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <div class="text-sm font-bold text-slate-800">{{ formatCurrency(t.companyShare) }}</div>
                <div class="group/info relative cursor-pointer" v-if="t.commissionNote">
                  <Info class="w-4 h-4 text-slate-300 hover:text-blue-500 transition-colors" />
                  <div class="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-20">
                    {{ t.commissionNote }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Agent Split -->
            <td class="px-6 py-4 text-right">
              <template v-if="t.listingAgent._id === t.sellingAgent._id">
                <div class="text-sm font-bold text-slate-800">{{ formatCurrency(t.listingAgentShare + t.sellingAgentShare) }}</div>
                <div class="text-[10px] font-medium text-slate-400 mt-0.5">Solo Deal - 50% Commission</div>
              </template>
              <template v-else>
                <div class="text-sm font-bold text-slate-800">{{ formatCurrency(t.listingAgentShare) }} ea.</div>
                <div class="text-[10px] font-medium text-slate-400 mt-0.5">25/25 Split</div>
              </template>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 text-center">
              <div class="inline-flex items-center justify-center px-2.5 py-1 text-[10px] font-bold uppercase rounded"
                   :class="getStatusColor(t.status)">
                {{ t.status }}
              </div>
            </td>
            
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-[#F8FAFC]">
      <div class="text-xs text-slate-500 font-medium">
        Showing <span class="font-bold text-slate-800">{{ transactions.length }}</span> of 142 transactions
      </div>
      <div class="flex gap-1">
        <button class="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:text-slate-600 shadow-sm disabled:opacity-50">
          &lt;
        </button>
        <button class="w-8 h-8 flex items-center justify-center rounded border border-[#0F172A] bg-[#0F172A] text-white font-semibold shadow-sm">
          1
        </button>
        <button class="w-8 h-8 flex items-center justify-center rounded border border-transparent bg-transparent text-slate-500 font-medium hover:bg-slate-200">
          2
        </button>
        <button class="w-8 h-8 flex items-center justify-center rounded border border-transparent bg-transparent text-slate-500 font-medium hover:bg-slate-200">
          3
        </button>
        <button class="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:text-slate-700 shadow-sm">
          &gt;
        </button>
      </div>
    </div>

  </div>
</template>
