<template>
    <div
        v-if="state.isShow"
        :class="['sc-bar', state.isMe ? 'isMe' : 'notMe']"
        :style="state.styleObject"
        :draggable="'true'"
        @dragstart="moveStart"
        @dragend="moveEnd"
        @dragover="editting"
        @mouseup="mouseup"
        @mousemove="mousemove"
        @click="$emit('click-event')"
    >
        <el-popconfirm
            title="Вы уверены, что хотите удалить запись?"
            width="200"
            confirm-button-text="Да"
            cancel-button-text="Нет"
            @confirm="deleteEvent"
        >
            <template #reference>
                <span class="delete-icon">✖</span>
            </template>
        </el-popconfirm>

        <span class="edit-icon" @click="editEvent">✎</span>

        <el-tooltip
            placement="top"
            :content="`${formatDisplayDate(startText)}～${formatDisplayDate(
                endText,
            )}`"
            trigger="click"
        >
            <span class="head">
                <span class="startTime time">{{
                    formatDisplayDate(startText)
                }}</span
                >～<span class="endTime time">{{
                    formatDisplayDate(endText)
                }}</span>
            </span>
        </el-tooltip>

        <el-tooltip placement="bottom" :content="contentText" trigger="click">
            <span class="text">{{ contentText }}</span>
        </el-tooltip>

        <div
            class="resizable-e"
            :draggable="'true'"
            @dragstart="editStart"
            @dragend="editEnd"
        ></div>
    </div>
</template>

<script>
import { defineComponent, reactive, watch } from 'vue'
import moment from 'moment'

export default defineComponent({
    name: 'ReservedDiv',
    props: {
        rowIndex: Number,
        keyNo: Number,
        unitWidth: Number,
        unitHeight: Number,
        titleDivWidth: Number,
        borderWidth: Number,
        startText: String,
        endText: String,
        contentText: String,
        minDate: String,
        maxDate: String,
        unit: Number,
        clearSwitch: Boolean,
        dragenterRowIndex: Number,
        dragenterKeyIndex: Number,
        isSelecting: Boolean,
        isSelectingRowIndex: Number,
        isSelectingIndex: Number,
    },
    setup(props, { emit }) {
        const state = reactive({
            styleObject: {
                Opacity: 1,
                left: '0px',
                width: '0px',
                height: '50px',
            },
            isShow: false,
            mouseXStarted: null,
            startLineNo: null,
            endLineNo: null,
            isMe: false,
            isEdit: false,
            isMove: false,
        })

        const setLeftPosition = () => {
            const a = moment(props.minDate)
            const b = moment(props.startText)

            const leftDiff = b.diff(a, 'days')
            state.startLineNo = leftDiff
            let shiftLeft =
                props.unitWidth * leftDiff + leftDiff * props.borderWidth
            state.styleObject.left = shiftLeft + 'px'
        }

        const setWidth = () => {
            const a = moment(props.startText)
            const b = moment(props.endText)
            const rightDiff = b.diff(a, 'days')
            state.endLineNo = state.startLineNo + rightDiff
            let width =
                props.unitWidth * rightDiff + rightDiff * props.borderWidth
            state.styleObject.width = width + 'px'
        }

        const formatDisplayDate = (date) =>
            moment(date).format('DD-MM-YYYY HH:mm')

        const editStart = (e) => {
            if (props.isSelecting) {
                e.preventDefault()
                return
            }
            state.isEdit = true
            state.mouseXStarted = e.clientX
            state.styleObject.Opacity = 0.5
        }

        const editting = (e) => {
            if (props.isSelecting) {
                e.preventDefault()
                return
            }
            if (state.isEdit) {
                if (e) {
                    let width = e.x + e.layerX
                    if (state.mouseXStarted > width) {
                        state.mouseXStarted = width
                        return
                    }

                    let movePx = e.clientX - state.mouseXStarted
                    let unitCnt = parseInt(movePx / props.unitWidth)

                    if (unitCnt !== 0) {
                        state.mouseXStarted = e.clientX
                        emit(
                            'edit-schedule-data',
                            props.rowIndex,
                            props.keyNo,
                            unitCnt,
                        )
                    }
                } else {
                    // adjust by current unit-div number
                    if (props.dragenterKeyIndex > state.startLineNo) {
                        state.mouseXStarted += props.unitWidth
                        let unitCnt = parseInt(
                            props.dragenterKeyIndex - state.endLineNo,
                        )
                        emit(
                            'edit-schedule-data',
                            props.rowIndex,
                            props.keyNo,
                            unitCnt,
                        )
                    }
                }
            }
        }

        const editEnd = () => {
            if (state.isEdit) {
                emit('edit-event', props.startText, props.endText)
            }
            state.isEdit = false
            state.styleObject.Opacity = 1
            state.mouseXStarted = null
        }

        const moveStart = (e) => {
            if (props.isSelecting) {
                e.preventDefault()
                return
            }
            if (!state.isEdit) {
                state.styleObject.Opacity = 0.5
                state.isMove = true
                state.mouseXStarted = e.clientX
                emit('set-dragenter-row-and-index', props.rowIndex, null)
            }
        }

        const moveEnd = (e) => {
            let mouseXEnd = e.clientX
            if (
                state.isMove &&
                (mouseXEnd !== state.mouseXStarted ||
                    props.dragenterRowIndex !== props.rowIndex)
            ) {
                let moveXPx = mouseXEnd - state.mouseXStarted
                let unitCnt = parseInt(moveXPx / props.unitWidth)
                let halfWidth = parseInt(props.unitWidth / 2)
                let modXPx = parseInt(moveXPx % props.unitWidth)
                if (moveXPx < 0 && Math.abs(modXPx) >= halfWidth) {
                    unitCnt--
                }
                state.mouseXStarted = null

                if (
                    unitCnt !== 0 ||
                    props.dragenterRowIndex !== props.rowIndex
                ) {
                    emit(
                        'move-schedule-data',
                        props.rowIndex,
                        props.keyNo,
                        unitCnt,
                    )
                }
            }

            state.isEdit = false
            state.isMove = false
            state.styleObject.Opacity = 1
        }

        const deleteEvent = () => {
            emit('delete-schedule-data', props.rowIndex, props.keyNo)
        }

        const editEvent = () => {
            emit('edit-schedule-pencil-click', props.rowIndex, props.keyNo)
        }

        const mousemove = (e) => {
            if (
                props.rowIndex === props.isSelectingRowIndex &&
                props.keyNo === props.isSelectingIndex
            ) {
                if (props.isSelecting && state.mouseXStarted) {
                    let movePx = e.clientX - state.mouseXStarted
                    let unitCnt = parseInt(movePx / props.unitWidth)
                    if (unitCnt !== 0 && unitCnt < 0) {
                        state.mouseXStarted = e.clientX + props.unitWidth
                        emit(
                            'edit-schedule-data',
                            props.rowIndex,
                            props.keyNo,
                            unitCnt,
                        )
                    }
                }
                if (props.isSelecting && !state.mouseXStarted) {
                    state.mouseXStarted = e.clientX
                    state.styleObject.Opacity = 0.5
                }
            }
        }

        const mouseup = () => {
            emit('mouse-up', props.startText, props.endText)
        }

        watch(
            () => props.startText,
            (newVal, oldVal) => {
                if (newVal !== oldVal) {
                    setLeftPosition()
                    setWidth()
                }
            },
        )

        watch(
            () => props.minDate,
            (newVal, oldVal) => {
                if (newVal !== oldVal) {
                    setLeftPosition()
                }
            },
        )

        watch(
            () => props.maxDate,
            (newVal, oldVal) => {
                if (newVal !== oldVal) {
                    setLeftPosition()
                }
            },
        )

        watch(
            () => props.endText,
            (newVal, oldVal) => {
                if (newVal !== oldVal) {
                    setLeftPosition()
                    setWidth()
                }
            },
        )

        watch(
            () => props.dragenterKeyIndex,
            (newVal, oldVal) => {
                if (
                    newVal !== oldVal &&
                    props.dragenterRowIndex === props.rowIndex &&
                    state.isEdit
                ) {
                    editting()
                }
            },
        )

        watch(
            () => props.clearSwitch,
            (newVal, oldVal) => {
                if (newVal !== oldVal) {
                    editEnd()
                }
            },
        )

        setLeftPosition()
        setWidth()
        state.isShow = true

        return {
            state,
            setLeftPosition,
            setWidth,
            editStart,
            editting,
            editEnd,
            moveStart,
            moveEnd,
            deleteEvent,
            mousemove,
            mouseup,
            formatDisplayDate,
            editEvent,
        }
    },
})
</script>

<style scoped>
.delete-icon {
    float: right;
    padding: 5px;
    transition: 0.3s all ease;

    &:hover {
        transform: scale(1.3);
    }
}

.edit-icon {
    float: right;
    padding: 6px 5px;
    height: 15px;
    font-size: 17px;
    display: flex;
    align-items: center;
    transition: 0.3s all ease;

    &:hover {
        transform: scale(1.3);
    }
}
</style>
