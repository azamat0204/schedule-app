import { reactive, ref } from 'vue'
import moment from 'moment/moment'

export const useScheduleSetting = () => {
    const monthDate = ref('')

    const setting = reactive({
        startDate: '2023-01-01',
        endDate: '2023-12-01',
        unit: 60, // Minutes
        borderW: 1, // Px
        dateDivH: 25, // Высота дней (месяцев в будущем)
        timeDivH: 25, // Высота времени (дней в будушем)
        unitDivW: 50, // Ширина отдельной ячейки в таблице
        titleDivW: 20, //  Длина навзвании комнат в процентах
        rowH: 50, //  Высота столбцов в px
    })

    const setDateToLastHalfYear = () => {
        const currentMonth = moment().set('date', 1)
        const todayPlusSixMonth = moment().add(6, 'months')
        monthDate.value = [currentMonth.toDate(), todayPlusSixMonth.toDate()]
        setting.startDate = currentMonth.format('YYYY-MM-DD')
        setting.endDate = todayPlusSixMonth.format('YYYY-MM-DD')
    }

    const setMonthDate = (value) => {
        monthDate.value = value

        if (value) {
            setting.startDate = moment(value[0]).format('YYYY-MM-DD')
            setting.endDate = moment(value[1]).format('YYYY-MM-DD')
        }
    }

    return {
        monthDate,
        setMonthDate,
        setting,
        setDateToLastHalfYear,
    }
}
