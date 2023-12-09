<template>
    <el-dialog
        class="dialog"
        v-bind="$attrs"
        width="600"
        lock-scroll
        :show-close="false"
        @close="resetAddScheduleState"
        @open="initReservedData"
    >
        <template #header>
            <div class="header">
                <p class="title">Редактирование</p>

                <el-icon
                    class="icon"
                    @click="emit('update:model-value', false)"
                >
                    <Close />
                </el-icon>
            </div>
        </template>

        <el-input
            v-model="v$.surname.$model"
            :class="{ danger: v$.surname.$error }"
            placeholder="Фамилия"
            clearable
            class="item"
            @blur="v$.surname.$touch"
        />

        <el-input
            v-model="v$.name.$model"
            placeholder="Имя"
            :class="{ danger: v$.name.$error }"
            clearable
            class="item"
            @blur="v$.name.$touch"
        />

        <el-input
            v-model="v$.middlename.$model"
            :class="{ danger: v$.middlename.$error }"
            placeholder="Отчество"
            clearable
            class="item"
            @blur="v$.middlename.$touch"
        />

        <el-input
            v-model="v$.totalPrice.$model"
            v-maska
            :class="{ danger: v$.totalPrice.$error }"
            placeholder="Сумма"
            data-maska="#########################"
            clearable
            class="item"
            @blur="v$.totalPrice.$touch"
        />

        <el-select
            v-model="v$.room.$model"
            :class="{ danger: v$.room.$error }"
            placeholder="Команата"
            clearable
            class="select item"
            @blur="v$.room.$touch"
        >
            <el-option
                v-for="(room, index) in rooms"
                :key="index"
                :label="room.title"
                :value="room.id"
            />
        </el-select>

        <div class="date-wrapper">
            <el-date-picker
                v-model="v$.startDate.$model"
                type="date"
                placeholder="Дата заезда"
                class="date item"
                :class="{ danger: v$.startDate.$error }"
                clearable
                @blur="v$.startDate.$touch"
            />

            <el-time-picker
                v-model="v$.startDateTime.$model"
                :class="{ danger: v$.startDateTime.$error }"
                placeholder="Время заезда"
                class="date item"
                clearable
                @blur="v$.startDateTime.$touch"
            />
        </div>

        <div class="date-wrapper">
            <el-date-picker
                v-model="v$.endDate.$model"
                :class="{ danger: v$.endDate.$error }"
                type="date"
                placeholder="Дата выезда"
                class="date item"
                clearable
                @blur="v$.endDate.$touch"
            />

            <el-time-picker
                v-model="v$.endDateTime.$model"
                :class="{ danger: v$.endDateTime.$error }"
                placeholder="Время выезда"
                class="date item"
                clearable
                @blur="v$.endDateTime.$touch"
            />
        </div>

        <div class="actions">
            <el-button
                type="danger"
                @click="$emit('update:model-value', false)"
            >
                Отмена
            </el-button>
            <el-button
                type="primary"
                :disabled="v$.$invalid || !v$.$anyDirty"
                :loading="lazyGlobalSourceDataLoading"
                @click="updateScheduleDateWrapper"
            >
                Отредактировать
            </el-button>
        </div>
    </el-dialog>
</template>
<script setup>
import { nextTick } from 'vue'
import { vMaska } from "maska"
import { useSchedule } from '@/composables/useSchedule'
import { useRoom } from '@/composables/useRoom'
import { combineDateTime } from '@/helpers/combineDateTime'
import { useGlobalLoading } from '@/composables/useGlobalLoading'

const { fetchSourceData } = useRoom()
const { v$, addScheduleState, updateScheduleDate, resetAddScheduleState } =
    useSchedule('edit-schedule')
const { lazyGlobalSourceDataLoading } = useGlobalLoading()

const emit = defineEmits(['update:model-value'])
const updateScheduleDateWrapper = () =>
    updateScheduleDate(
        {
            id: props.reservedData.id,
            name: addScheduleState.name,
            surname: addScheduleState.surname,
            middlename: addScheduleState.middlename,
            price: addScheduleState.totalPrice,
            roomId: addScheduleState.room,
            startDate: combineDateTime(
                addScheduleState.startDate,
                addScheduleState.startDateTime,
            ),
            endDate: combineDateTime(
                addScheduleState.endDate,
                addScheduleState.endDateTime,
            ),
        },
        () => {
            fetchSourceData()
            resetAddScheduleState()
            emit('update:model-value', false)
        },
    )

const props = defineProps({
    rooms: Array,
    reservedData: Object,
})

const initReservedData = () => {
    addScheduleState.startDate = props.reservedData.start
    addScheduleState.endDate = props.reservedData.end
    addScheduleState.startDateTime = props.reservedData.start
    addScheduleState.endDateTime = props.reservedData.end
    addScheduleState.name = props.reservedData.name
    addScheduleState.surname = props.reservedData.surname
    addScheduleState.middlename = props.reservedData.middlename
    addScheduleState.totalPrice = props.reservedData.price
    addScheduleState.room = props.reservedData.roomId
    nextTick(() => {
        v$.value.$reset()
    })
}
</script>
<style lang="scss" scoped>
.item {
    margin-bottom: 12px;
}

.select {
    display: block;
}

.date-wrapper {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 12px;
}

.title {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
}

.actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.icon {
    cursor: pointer;
}

:deep(.el-date-editor.el-input) {
    --el-date-editor-width: 100%;
}
</style>
