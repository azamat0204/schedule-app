<template>
    <div id="app">
        <div class="main">
            <div class="add-box">
                <div class="add-box__title">Добавить расписание</div>

                <div class="add-box__contact-info">
                    <el-input
                        v-model="v$.surname.$model"
                        :class="{ danger: v$.surname.$error }"
                        placeholder="Фамилия"
                        clearable
                        @blur="v$.surname.$touch"
                    />

                    <el-input
                        v-model="v$.name.$model"
                        placeholder="Имя"
                        :class="{ danger: v$.name.$error }"
                        clearable
                        @blur="v$.name.$touch"
                    />

                    <el-input
                        v-model="v$.middlename.$model"
                        :class="{ danger: v$.middlename.$error }"
                        placeholder="Отчество"
                        clearable
                        @blur="v$.middlename.$touch"
                    />

                    <el-input
                        v-model="v$.totalPrice.$model"
                        v-maska
                        :class="{ danger: v$.totalPrice.$error }"
                        placeholder="Сумма"
                        data-maska="#########################"
                        clearable
                        @blur="v$.totalPrice.$touch"
                    />
                </div>

                <div class="add-box__room-info">
                    <el-select
                        v-model="v$.room.$model"
                        :class="{ danger: v$.room.$error }"
                        placeholder="Команата"
                        clearable
                        @blur="v$.room.$touch"
                    >
                        <el-option
                            v-for="(room, index) in rooms"
                            :key="index"
                            :label="room.title"
                            :value="room.id"
                        />
                    </el-select>

                    <el-date-picker
                        v-model="v$.startDate.$model"
                        type="date"
                        placeholder="Дата заезда"
                        class="date"
                        :class="{ danger: v$.startDate.$error }"
                        clearable
                        @blur="v$.startDate.$touch"
                    />

                    <el-time-picker
                        v-model="v$.startDateTime.$model"
                        :class="{ danger: v$.startDateTime.$error }"
                        placeholder="Время заезда"
                        class="date"
                        clearable
                        @blur="v$.startDateTime.$touch"
                    />

                    <el-date-picker
                        v-model="v$.endDate.$model"
                        :class="{ danger: v$.endDate.$error }"
                        type="date"
                        placeholder="Дата выезда"
                        class="date"
                        clearable
                        @blur="v$.endDate.$touch"
                    />

                    <el-time-picker
                        v-model="v$.endDateTime.$model"
                        :class="{ danger: v$.endDateTime.$error }"
                        placeholder="Время выезда"
                        class="date"
                        clearable
                        @blur="v$.endDateTime.$touch"
                    />
                </div>
                <div class="add-box__actions">
                    <el-button type="danger" @click="resetAddScheduleState">
                        Очистить форму
                    </el-button>
                    <el-button
                        type="primary"
                        :loading="sourceDataLoading"
                        @click="createSchedule"
                    >
                        Добавить расписание
                    </el-button>
                </div>
            </div>
            <div class="content">
                <div class="content__calendar">
                    <el-date-picker
                        v-model="monthDate"
                        class="content__date-picker"
                        :model-value="monthDate"
                        type="monthrange"
                        range-separator="До"
                        start-placeholder="Начала месяца"
                        end-placeholder="Конец месяца"
                        :clearable="false"
                        @update:model-value="setMonthDate"
                    />
                </div>
                <div v-loading="sourceDataLoading" class="content__body">
                    <sc
                        :schedule-data="sourceData"
                        :setting="setting"
                        @row-click-event="rowClickEvent"
                        @date-click-event="dateClickEvent"
                        @click-event="clickEvent"
                        @add-event="addEvent"
                        @move-event="moveEvent"
                        @edit-event="editEvent"
                        @delete-event="deleteEvent"
                    ></sc>
                </div>
            </div>
            <div style="display: flex">
                <span>Инструкция:</span>
                <div class="sample"></div>
                <span>Нормально</span>
                <div class="sample cant-res"></div>
                <span>Не рабочий день</span>
                <div class="sample reserved"></div>
                <span>Забронировано</span>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment'
import schedulerLite from './components/SchedulerLite.vue'
import { useSchedule } from '@/composables/useSchedule.ts'
import { vMaska } from 'maska'
import { useRoom } from '@/composables/useRoom.ts'

export default {
    name: 'App',
    directives: { maska: vMaska },
    components: {
        sc: schedulerLite,
    },
    setup() {
        const { fetchSourceData, sourceDataLoading, sourceData, rooms } =
            useRoom()

        const { v$, addScheduleState, resetAddScheduleState, createSchedule } =
            useSchedule()

        const createScheduleWrapper = () => createSchedule(fetchSourceData)

        return {
            v$,
            rooms,
            addScheduleState,
            resetAddScheduleState,
            fetchSourceData,
            sourceDataLoading,
            createSchedule: createScheduleWrapper,
            sourceData,
        }
    },
    data: function () {
        return {
            monthDate: '',
            startDate: null,
            scData: [],
            setting: {
                startDate: '2023-01-01',
                endDate: '2023-12-01',
                unit: 60, // Minutes
                borderW: 1, // Px
                dateDivH: 25, // Высота дней (месяцев в будущем)
                timeDivH: 25, // Высота времени (дней в будушем)
                unitDivW: 40, // Ширина отдельной ячейки в таблице
                titleDivW: 20, //  Длина навзвании комнат в процентах
                rowH: 50, //  Высота столбцов в px
            },
        }
    },
    created() {
        //this.setDateToLastHalfYear()
        this.fetchSourceData()
    },
    methods: {
        setMonthDate(value) {
            this.monthDate = value

            if (value) {
                this.setting.startDate = moment(value[0]).format('YYYY-MM-DD')
                this.setting.endDate = moment(value[1]).format('YYYY-MM-DD')
            }
        },
        setDateToLastHalfYear() {
            const currentMonth = moment().set('date', 1)
            const todayPlusSixMonth = moment().add(6, 'months')
            this.monthDate = [currentMonth.toDate(), todayPlusSixMonth.toDate()]
            this.setting.startDate = currentMonth.format('YYYY-MM-DD')
            this.setting.endDate = todayPlusSixMonth.format('YYYY-MM-DD')
        },
        dateClickEvent(date) {
            console.log('------')
            console.log('DateClickEvent:')
            console.log('Date:' + date)
        },
        rowClickEvent(rowIndex, text) {
            console.log('------')
            console.log('RowClickEvent:')
            console.log('RowIndex:' + rowIndex)
            console.log('RowTitle:' + text)
        },
        clickEvent(startDate, endDate, text, other) {
            console.log('------')
            console.log('ClickEvent:')
            console.log('StartDate:' + startDate)
            console.log('EndDate:' + endDate)
            console.log('ContentText:' + text)
            if (other) {
                console.log('OtherData:')
                console.log(other)
            }
        },
        addEvent(rowIndex, startDate, endDate) {
            console.log('------')
            console.log('AddEvent:')
            console.log('RowIndex:' + rowIndex)
            console.log('StartDate:' + startDate)
            console.log('EndDate:' + endDate)
        },
        moveEvent(status, newStartDate, newEndDate) {
            console.log('------')
            console.log('MoveEvent:')
            if (status == 1) {
                console.log('NewStartDate:' + newStartDate)
                console.log('NewEndDate:' + newEndDate)
            } else if (status == 2) {
                console.log("Has other event, can't move.")
            } else {
                console.log("Not businessDay, can't move.")
            }
        },
        editEvent(newStartDate, newEndDate) {
            console.log('------')
            console.log('EditEvent:')
            console.log('NewStartDate:' + newStartDate)
            console.log('NewEndDate:' + newEndDate)
        },
        deleteEvent(row, index) {
            console.log('------')
            console.log('DeleteEvent:')
            console.log('Row:' + row)
            console.log('Index:' + index)
        },
        addNewRow() {
            let newTitle = 'Room' + (this.scData.length + 1)
            this.scData.push({
                title: newTitle,
                noBusinessDate: [],
                businessHours: [],
                schedule: [],
            })
        },
    },
}
</script>

<style lang="scss">
.sample {
    width: 10px;
    height: 10px;
    margin: 5px;
    border: 1px solid black;
}

.cant-res {
    background-color: #999 !important;
}

.reserved {
    background-color: #ec920a !important;
}

.main {
    padding: 15px;
}

.content {
    &__calendar {
        display: grid;
        justify-content: flex-end;
        margin-bottom: 10px;
    }

    &__date-picker {
    }
}

.add-box {
    box-shadow: rgba(0, 0, 0, 0.16) 0 1px 4px;
    padding: 15px;
    margin-bottom: 30px;
    border-radius: 8px;

    &__title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 15px;
    }

    &__contact-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        margin-bottom: 15px;
    }

    &__room-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;

        & > div {
            flex: 100%;
        }
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
    }
}

:deep(.el-date-editor.el-input) {
    --el-date-editor-width: 100%;
}

.danger {
    .el-input__wrapper,
    .el-textarea__inner {
        --el-input-hover-border-color: #ff6b56;
        --el-input-hover-border: #ff6b56;
        --el-input-border-color: #ff5a43;
        --el-input-focus-border-color: #e5513c;
    }

    input::placeholder {
        color: #ff6b56;
    }

    .el-input__icon {
        color: #ff6b56;
    }
}
</style>
