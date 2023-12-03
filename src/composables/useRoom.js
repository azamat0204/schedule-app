import { computed, ref } from 'vue'
import { ElNotification } from 'element-plus'
import * as roomApi from '../api/rooms'
import { useGlobalLoading } from '@/composables/useGlobalLoading'

export const useRoom = () => {
    const sourceData = ref([])
    const { setGlobalLoadingOn, setGlobalLoadingOff } = useGlobalLoading()
    const fetchSourceData = async () => {
        try {
            setGlobalLoadingOn()
            const response = await roomApi.getRooms()
            sourceData.value = getMappedRooms(response.result.rooms)
        } catch (e) {
            ElNotification({
                title: 'Ошибка',
                message: 'Не удалось получить список комнат',
                type: 'error',
            })
            console.error(e.message)
        } finally {
            setGlobalLoadingOff()
        }
    }

    const getMappedRooms = (rooms) => {
        return rooms.map((room) => ({
            id: room.id,
            title: room.name,
            noBusinessDate: room.NoBussinessDays.map(
                (bussinessDay) => bussinessDay.date,
            ),
            schedule: room.Schedules.map((schedule) => ({
                id: schedule.id,
                roomId: schedule.roomId,
                text: `${schedule.surname} ${schedule.name} ${schedule.middlename}. Цена: ${schedule.price} тенге`,
                start: schedule.startDate,
                end: schedule.endDate,
            })),
        }))
    }

    const rooms = computed(() =>
        sourceData.value.map((room) => ({
            id: room.id,
            title: room.title,
        })),
    )

    return {
        fetchSourceData,
        sourceData,
        rooms,
    }
}
