import { ref, watch } from 'vue'

const globalSourceDataLoading = ref(false)
const lazyGlobalSourceDataLoading = ref(false)
const timerId = ref(null)
export const useGlobalLoading = () => {
    watch(
        () => globalSourceDataLoading.value,
        () => {
            clearTimeout(timerId.value)
            if (globalSourceDataLoading.value) {
                timerId.value = setTimeout(() => {
                    lazyGlobalSourceDataLoading.value = true
                }, 100)
            } else {
                lazyGlobalSourceDataLoading.value = false
            }
        },
        {
            immediate: true,
            deep: true,
        },
    )

    const setGlobalLoadingOn = () => (globalSourceDataLoading.value = true)
    const setGlobalLoadingOff = () => (globalSourceDataLoading.value = false)

    return {
        setGlobalLoadingOn,
        setGlobalLoadingOff,
        lazyGlobalSourceDataLoading,
    }
}
