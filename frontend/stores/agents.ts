import { defineStore } from 'pinia'

interface Agent {
  _id: string
  name: string
  email: string
  phone?: string
  createdAt?: string
  updatedAt?: string
}

export const useAgentsStore = defineStore('agents', {
  state: () => ({
    agents: [] as Agent[],
    currentAgent: null as Agent | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    agentCount: (state) => state.agents.length,

    agentOptions: (state) =>
      state.agents.map((a) => ({
        label: a.name,
        value: a._id,
      })),
  },

  actions: {
    getApiBase() {
      const config = useRuntimeConfig()
      return config.public.apiBase || 'http://localhost:3001'
    },

    async fetchAgents() {
      this.loading = true
      this.error = null
      try {
        const data = await $fetch<Agent[]>(`${this.getApiBase()}/agents`)
        this.agents = data
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to fetch agents'
        console.error('fetchAgents error:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchAgent(id: string) {
      this.loading = true
      this.error = null
      try {
        const data = await $fetch<Agent>(`${this.getApiBase()}/agents/${id}`)
        this.currentAgent = data
        return data
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to fetch agent'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createAgent(payload: { name: string; email: string; phone?: string }) {
      this.loading = true
      this.error = null
      try {
        const data = await $fetch<Agent>(`${this.getApiBase()}/agents`, {
          method: 'POST',
          body: payload,
        })
        this.agents.push(data)
        return data
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to create agent'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
