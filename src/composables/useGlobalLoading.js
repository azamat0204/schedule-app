import { ref } from 'vue'

const globalSourceDataLoading = ref(false)

export const useGlobalLoading = () => ({
    globalSourceDataLoading,
})
