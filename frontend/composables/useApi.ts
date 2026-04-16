export const useApi = () => {
  const config = useRuntimeConfig()
  // Backend'in default olarak 3001 üzerinden çalıştığını varsayıyoruz (Nuxt ile 3000 portu çakışmasın)
  const baseURL = config.public.apiBase || 'http://localhost:3001'

  const fetcher = <T>(endpoint: string, options = {}) => {
    return useFetch<T>(endpoint, {
      baseURL,
      ...options,
    })
  }

  return {
    fetcher
  }
}
