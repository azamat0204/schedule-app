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
                        placeholder="Комната"
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
                <div class="add-box__bottom">
                  <el-input
                      v-model="v$.comment.$model"
                      placeholder="Комментарий"
                      clearable
                      maxlength="90"
                      show-word-limit
                  />

                  <div class="add-box__actions">
                    <el-button type="danger" @click="resetAddScheduleState">
                      Очистить форму
                    </el-button>
                    <el-button
                        type="primary"
                        :loading="createScheduleLoading"
                        :disabled="v$.$invalid"
                        @click="createScheduleWrapper"
                    >
                      Добавить расписание
                    </el-button>
                  </div>
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
                <div
                    v-loading="lazyGlobalSourceDataLoading"
                    class="content__body"
                >
                    <sc
                        :schedule-data="sourceData"
                        :setting="setting"
                        @move-event="updateScheduleWrapper"
                        @edit-event="updateScheduleWrapper"
                        @delete-event="deleteScheduleWrapper"
                        @edit-schedule-pencil-click="editSchedulePencilClick"
                        v-if="sourceData.length > 0"
                    ></sc>
                  <el-empty v-else />
                </div>
            </div>
            <div style="display: flex"  v-if="sourceData.length > 0">
                <span>Инструкция:</span>
                <div class="sample"></div>
                <span>Нормально</span>
                <div class="sample cant-res"></div>
                <span>Не рабочий день</span>
                <div class="sample reserved"></div>
                <span>Забронировано</span>
                <div class="sample almostEnd"></div>
                <span>День выезда</span>
            </div>
        </div>
        <edit-schedule
            v-model="showEditModal"
            :rooms="rooms"
            :reserved-data="edittingReservedData"
        />
    </div>
</template>

<script setup>
import sc from './components/SchedulerLite.vue'
import EditSchedule from '@/components/EditSchedule.vue'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoom } from '@/composables/useRoom.js'
import { useSchedule } from '@/composables/useSchedule.js'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useScheduleSetting } from '@/composables/useScheduleSetting'
import { vMaska } from 'maska'
import moment from "moment"

const { monthDate, setting, setDateToLastHalfYear, setMonthDate } =
    useScheduleSetting()

const { fetchSourceData, sourceData, rooms } = useRoom()

const {
    v$,
    addScheduleState,
    resetAddScheduleState,
    createSchedule,
    createScheduleLoading,
    deleteSchedule,
    updateScheduleDate,
} = useSchedule()

const showEditModal = ref(false)
const edittingReservedData = ref(null)

const editSchedulePencilClick = (rowIndex, keyNo) => {
    edittingReservedData.value = sourceData.value[rowIndex].schedule[keyNo]
    showEditModal.value = true
}
const createScheduleWrapper = () =>
    createSchedule(addScheduleState, () => {
        fetchSourceData()
        resetAddScheduleState()
    })

const deleteScheduleWrapper = (rowIndex, keyNo) => {
    const id = sourceData.value[rowIndex].schedule[keyNo].id
    deleteSchedule(id, fetchSourceData)
}

const updateScheduleWrapper = (status, startDate, endDate, id, roomId) => {
    if (status === 1) {
        updateScheduleDate({ id, roomId, startDate, endDate }, fetchSourceData)
    } else if (status === 2) {
        ElMessage({
            type: 'info',
            message: 'Нельзя переместить, дата забронирована',
        })
    } else {
        ElMessage({
            type: 'info',
            message: 'Нельзя переместить, не рабочий день',
        })
    }
}

const { lazyGlobalSourceDataLoading } = useGlobalLoading()

onMounted(() => {
    fetchSourceData()
    setDateToLastHalfYear()
})
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

.almostEnd{
  background-color: #f56c6c;
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

    &__bottom{
      display: flex;
      align-items: center;
      margin-top: 20px;
      gap: 15px;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
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
