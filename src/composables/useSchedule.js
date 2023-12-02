import moment from 'moment'
import { nextTick, reactive, ref } from 'vue'
import { required, helpers } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import { ElNotification } from 'element-plus'
import * as scheduleApi from '../api/schedule'
import { useGlobalLoading } from '@/composables/useGlobalLoading'

export const useSchedule = () => {
    const { globalSourceDataLoading } = useGlobalLoading()

    const addScheduleInitialState = {
        name: '',
        surname: '',
        middlename: '',
        totalPrice: '',
        room: '',
        startDate: '',
        startDateTime: '',
        endDate: '',
        endDateTime: '',
    }
    const addScheduleState = reactive({
        ...addScheduleInitialState,
    })

    const rules = {
        name: {
            required: helpers.withMessage('Заполните поле', required),
        },
        surname: {
            required: helpers.withMessage('Заполните поле', required),
        },
        middlename: {
            required: helpers.withMessage('Заполните поле', required),
        },
        totalPrice: {
            required: helpers.withMessage('Заполните поле', required),
        },
        room: {
            required: helpers.withMessage('Заполните поле', required),
        },
        startDate: {
            required: helpers.withMessage('Заполните поле', required),
        },
        startDateTime: {
            required: helpers.withMessage('Заполните поле', required),
        },
        endDate: {
            required: helpers.withMessage('Заполните поле', required),
        },
        endDateTime: {
            required: helpers.withMessage('Заполните поле', required),
        },
    }
    const v$ = useVuelidate(rules, addScheduleState)

    const resetAddScheduleState = () => {
        Object.assign(addScheduleState, addScheduleInitialState)
        return nextTick(() => {
            v$.value.$reset()
        })
    }

    const createScheduleLoading = ref(false)
    const createSchedule = async (successCallback) => {
        try {
            createScheduleLoading.value = true
            const startDate = moment(
                `${moment(addScheduleState.startDate).format(
                    'YYYY-MM-DD',
                )} ${moment(addScheduleState.startDateTime).format('HH:mm')}`,
            ).format('YYYY-MM-DD HH:mm')

            const endDate = moment(
                `${moment(addScheduleState.endDate).format(
                    'YYYY-MM-DD',
                )} ${moment(addScheduleState.endDateTime).format('HH:mm')}`,
            ).format('YYYY-MM-DD HH:mm')

            const payload = {
                roomId: addScheduleState.room,
                name: addScheduleState.name,
                surname: addScheduleState.surname,
                middlename: addScheduleState.middlename,
                startDate: startDate,
                endDate: endDate,
                price: addScheduleState.totalPrice,
            }

            await scheduleApi.createSchedule(payload)

            resetAddScheduleState()
            successCallback?.()

            ElNotification({
                title: 'Успех!',
                message: 'Расписание успешно добавлено',
                type: 'success',
            })
        } catch (e) {
            ElNotification({
                title: 'Ошибка',
                message: 'Не удалось добавить расписание',
                type: 'error',
            })
            console.error(e.message)
        } finally {
            createScheduleLoading.value = false
        }
    }

    const deleteSchedule = async (id, successCallback) => {
        try {
            globalSourceDataLoading.value = true
            await scheduleApi.deleteSchedule(id)
            successCallback?.()
            ElNotification({
                title: 'Успех',
                message: 'Расписание успешнр удалено!',
                type: 'success',
            })
        } catch (e) {
            ElNotification({
                title: 'Ошибка',
                message: 'Не удалось удалить расписание',
                type: 'error',
            })
            console.error(e.message)
        } finally {
            globalSourceDataLoading.value
        }
    }

    return {
        createSchedule,
        deleteSchedule,
        createScheduleLoading,
        resetAddScheduleState,
        addScheduleState,
        v$,
    }
}
