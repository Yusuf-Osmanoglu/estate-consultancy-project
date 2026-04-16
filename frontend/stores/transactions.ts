import { defineStore } from 'pinia'

interface Agent {
  _id: string
  name: string
  email: string
  phone?: string
}

interface Transaction {
  _id: string
  propertyAddress: string
  totalServiceFee: number
  listingAgent: Agent
  sellingAgent: Agent
  companyShare: number
  listingAgentShare: number
  sellingAgentShare: number
  commissionNote: string
  status: 'agreement' | 'earnest_money' | 'title_deed' | 'completed'
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalRevenue: number
  totalCompanyProfit: number
  totalDeals: number
  completedDeals: number
  pendingDeals: number
}

interface FinancialBreakdown {
  transactionId: string
  propertyAddress: string
  totalServiceFee: number
  status: string
  breakdown: {
    agency: { amount: number; percentage: number; note: string }
    listingAgent: { id: string; name: string; amount: number; percentage: number; role: string }
    sellingAgent: { id: string; name: string; amount: number; percentage: number; role: string }
  }
  commissionNote: string
}

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [] as Transaction[],
    currentTransaction: null as Transaction | null,
    currentBreakdown: null as FinancialBreakdown | null,
    stats: null as Stats | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    completedTransactions: (state) =>
      state.transactions.filter((t) => t.status === 'completed'),

    pendingTransactions: (state) =>
      state.transactions.filter((t) => t.status !== 'completed'),

    formattedTotalRevenue: (state) => {
      if (!state.stats) return '$0'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(state.stats.totalRevenue)
    },

    formattedCompanyProfit: (state) => {
      if (!state.stats) return '$0'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(state.stats.totalCompanyProfit)
    },
  },

  actions: {
    getApiBase() {
      const config = useRuntimeConfig()
      return config.public.apiBase || 'http://localhost:3001'
    },

    async fetchTransactions() {
      this.loading = true
      this.error = null
      try {
        const data = await $fetch<Transaction[]>(`${this.getApiBase()}/transactions`)
        this.transactions = data
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to fetch transactions'
        console.error('fetchTransactions error:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      try {
        const data = await $fetch<Stats>(`${this.getApiBase()}/transactions/stats`)
        this.stats = data
      } catch (err: any) {
        console.error('fetchStats error:', err)
      }
    },

    async fetchTransaction(id: string) {
      this.loading = true
      this.error = null
      try {
        const data = await $fetch<Transaction>(`${this.getApiBase()}/transactions/${id}`)
        this.currentTransaction = data
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to fetch transaction'
      } finally {
        this.loading = false
      }
    },

    async fetchBreakdown(id: string) {
      try {
        const data = await $fetch<FinancialBreakdown>(
          `${this.getApiBase()}/transactions/${id}/breakdown`
        )
        this.currentBreakdown = data
      } catch (err: any) {
        console.error('fetchBreakdown error:', err)
      }
    },

    async createTransaction(payload: {
      propertyAddress: string
      totalServiceFee: number
      listingAgent: string
      sellingAgent: string
    }) {
      this.loading = true
      this.error = null
      try {
        const data = await $fetch<Transaction>(`${this.getApiBase()}/transactions`, {
          method: 'POST',
          body: payload,
        })
        // Yeni transaction'ı listenin başına ekle
        await this.fetchTransactions()
        await this.fetchStats()
        return data
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to create transaction'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateStage(id: string, stage: string) {
      this.error = null
      try {
        const data = await $fetch<Transaction>(
          `${this.getApiBase()}/transactions/${id}/stage`,
          {
            method: 'PATCH',
            body: { stage },
          }
        )
        // Güncellenen transaction'ı listedeki yerinde güncelle
        const index = this.transactions.findIndex((t) => t._id === id)
        if (index !== -1) {
          this.transactions[index] = {
            ...this.transactions[index],
            status: data.status,
          }
        }
        if (this.currentTransaction?._id === id) {
          this.currentTransaction.status = data.status
        }
        await this.fetchStats()
        return data
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to update stage'
        throw err
      }
    },
  },
})
