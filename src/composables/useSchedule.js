import { nextTick, reactive, ref } from 'vue'
import { required, helpers } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import { ElNotification } from 'element-plus'
import * as scheduleApi from '../api/schedule'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { combineDateTime } from '@/helpers/combineDateTime'
import moment from "moment";

export const useSchedule = (scope = 'schedule') => {
    const { setGlobalLoadingOff, setGlobalLoadingOn } = useGlobalLoading()

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

    const isEndDateGreaterThatStartDate = (value, siblings) => {
        if(!value || !siblings) return true
        return moment(value).toDate().getTime() >= moment(siblings.startDate).toDate().getTime()
    }

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
            isEndDateGreaterThatStartDate
        },
        endDateTime: {
            required: helpers.withMessage('Заполните поле', required),
        },
    }
    const v$ = useVuelidate(rules, addScheduleState, { $scope: scope })

    const resetAddScheduleState = () => {
        Object.assign(addScheduleState, addScheduleInitialState)
        return nextTick(() => {
            v$.value.$reset()
        })
    }

    const createScheduleLoading = ref(false)
    const createSchedule = async (payload, successCallback) => {
        try {
            createScheduleLoading.value = true

            const startDate = combineDateTime(
                payload.startDate,
                payload.startDateTime,
            )

            const endDate = combineDateTime(
                payload.endDate,
                payload.endDateTime,
            )


            await scheduleApi.createSchedule({
                roomId: payload.room,
                name: payload.name,
                surname: payload.surname,
                middlename: payload.middlename,
                startDate: startDate,
                endDate: endDate,
                price: payload.totalPrice,
            })

            successCallback?.()

            ElNotification({
                title: 'Успех!',
                message: 'Расписание успешно добавлено',
                type: 'success',
            })
        } catch (e) {
            ElNotification({
                title: 'Ошибка',
                message: 'Не удалось добавить расписание: ' + e.message,
                type: 'error',
            })
            console.error(e.message)
        } finally {
            createScheduleLoading.value = false
        }
    }

    const deleteSchedule = async (id, successCallback) => {
        try {
            setGlobalLoadingOn()
            await scheduleApi.deleteSchedule(id)
            successCallback?.()
            ElNotification({
                title: 'Успех',
                message: 'Расписание успешно удалено!',
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
            setGlobalLoadingOn()
        }
    }

    const updateScheduleDate = async (payload, successCallback) => {
        try {
            setGlobalLoadingOn()
            await scheduleApi.updateScheduleDate(payload)
            successCallback?.()
        } catch (e) {
            ElNotification({
                title: 'Ошибка',
                message: 'Не удалось изменить расписание',
                type: 'error',
            })
            console.error(e.message)
        } finally {
            setGlobalLoadingOff()
        }
    }

    return {
        createSchedule,
        deleteSchedule,
        updateScheduleDate,
        createScheduleLoading,
        resetAddScheduleState,
        addScheduleState,
        v$,
    }
}
