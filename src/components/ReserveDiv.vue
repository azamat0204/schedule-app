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
    <span style="float: right; padding: 5px" @click="deleteEvent">✖</span
    ><span class="head">
      <span class="startTime time">{{ startText }}</span
      >～<span class="endTime time">{{ endText }}</span>
    </span>
    <span class="text">{{ contentText }}</span>
    <div
        class="resizable-e"
        :draggable="'true'"
        @dragstart="editStart"
        @dragend="editEnd"
    ></div>
  </div>
</template>

<script>
import { defineComponent, reactive, watch } from "vue";
import moment from "moment";

export default defineComponent({
  name: "reserved-div",
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
        left: "0px",
        width: "0px",
        height: "50px",
      },
      isShow: false,
      mouseXStarted: null,
      startLineNo: null,
      endLineNo: null,
      isMe: false,
      isEdit: false,
      isMove: false,
    });


    const setLeftPosition = () => {
      const a = moment(props.minDate);
      const b = moment(props.startText);

      const leftDiff = b.diff(a, 'days')
      state.startLineNo = leftDiff;
      let shiftLeft = props.unitWidth * leftDiff + leftDiff * props.borderWidth;
      state.styleObject.left = shiftLeft + "px";
    };

    const setWidth = () => {
      const a = moment(props.startText);
      const b = moment(props.endText);
      const rightDiff = b.diff(a, 'days')
      state.endLineNo = state.startLineNo + rightDiff;
      let width = props.unitWidth * rightDiff + rightDiff * props.borderWidth;
      state.styleObject.width = width + "px";
    };
    /**
     * Set the Block to edit status
     *
     * @param Object e Event
     *
     * @returns void
     */
    const editStart = (e) => {
      if (props.isSelecting) {
        e.preventDefault();
        return;
      }
      state.isEdit = true;
      state.mouseXStarted = e.clientX;
      state.styleObject.Opacity = 0.5;
    };

    const editting = (e) => {
      if (props.isSelecting) {
        e.preventDefault();
        return;
      }
      if (state.isEdit) {
        if (e) {
          let width = e.x + e.layerX;
          if (state.mouseXStarted > width) {
            state.mouseXStarted = width;
            return;
          }

          let movePx = e.clientX - state.mouseXStarted;
          let unitCnt = parseInt(movePx / props.unitWidth);

          if (unitCnt != 0) {
            state.mouseXStarted = e.clientX;
            emit("edit-schedule-data", props.rowIndex, props.keyNo, unitCnt);
          }
        } else {
          // adjust by current unit-div number
          if (props.dragenterKeyIndex > state.startLineNo) {
            state.mouseXStarted += props.unitWidth;
            let unitCnt = parseInt(props.dragenterKeyIndex - state.endLineNo);
            emit("edit-schedule-data", props.rowIndex, props.keyNo, unitCnt);
          }
        }
      }
    };
    /**
     * End edit and set new data
     *
     * @returns void
     */
    const editEnd = () => {
      if (state.isEdit) {
        emit("edit-event", props.startText, props.endText);
      }
      state.isEdit = false;
      state.styleObject.Opacity = 1;
      state.mouseXStarted = null;
    };

    const moveStart = (e) => {
      if (props.isSelecting) {
        e.preventDefault();
        return;
      }
      if (!state.isEdit) {
        state.styleObject.Opacity = 0.5;
        state.isMove = true;
        state.mouseXStarted = e.clientX;
        emit("set-dragenter-row-and-index", props.rowIndex, null);
      }
    };

    const moveEnd = (e) => {
      let mouseXEnd = e.clientX;
      if (
          state.isMove &&
          (mouseXEnd != state.mouseXStarted ||
              props.dragenterRowIndex != props.rowIndex)
      ) {
        let moveXPx = mouseXEnd - state.mouseXStarted;
        let unitCnt = parseInt(moveXPx / props.unitWidth);
        let halfWidth = parseInt(props.unitWidth / 2);
        let modXPx = parseInt(moveXPx % props.unitWidth);
        if (moveXPx < 0 && Math.abs(modXPx) >= halfWidth) {
          unitCnt--;
        }
        state.mouseXStarted = null;

        if (unitCnt != 0 || props.dragenterRowIndex != props.rowIndex) {
          emit("move-schedule-data", props.rowIndex, props.keyNo, unitCnt);
        }
      }

      state.isEdit = false;
      state.isMove = false;
      state.styleObject.Opacity = 1;
    };

    const deleteEvent = () => {
      emit("delete-schedule-data", props.rowIndex, props.keyNo);
    };

    const mousemove = (e) => {
      if (
          props.rowIndex == props.isSelectingRowIndex &&
          props.keyNo == props.isSelectingIndex
      ) {
        if (props.isSelecting && state.mouseXStarted) {
          let movePx = e.clientX - state.mouseXStarted;
          let unitCnt = parseInt(movePx / props.unitWidth);
          if (unitCnt != 0 && unitCnt < 0) {
            state.mouseXStarted = e.clientX + props.unitWidth;
            emit("edit-schedule-data", props.rowIndex, props.keyNo, unitCnt);
          }
        }
        if (props.isSelecting && !state.mouseXStarted) {
          state.mouseXStarted = e.clientX;
          state.styleObject.Opacity = 0.5;
        }
      }
    };

    const mouseup = () => {
      emit("mouse-up", props.startText, props.endText);
    };
    /**
     * Get minutes diff between date1 and date2
     *
     * @param Object date1 DateObject1
     * @param Object date2 DateObject2
     *
     * @returns Int
     */
    const getMinutesDiff = (date1, date2) => {
      const diffTime = date2 - date1;
      return Math.ceil(diffTime / (1000 * 60));
    };

    watch(
        () => props.startText,
        (newVal, oldVal) => {
          if (newVal != oldVal) {
            setLeftPosition();
          }
        }
    );

    watch(
        () => props.endText,
        (newVal, oldVal) => {
          if (newVal != oldVal) {
            setWidth();
          }
        }
    );

    watch(
        () => props.dragenterKeyIndex,
        (newVal, oldVal) => {
          if (
              newVal != oldVal &&
              props.dragenterRowIndex == props.rowIndex &&
              state.isEdit
          ) {
            editting();
          }
        }
    );

    watch(
        () => props.clearSwitch,
        (newVal, oldVal) => {
          if (newVal != oldVal) {
            editEnd();
          }
        }
    );

    setLeftPosition();
    setWidth();
    state.isShow = true;

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
      getMinutesDiff,
    };
  },
});
</script>

<style scoped>
</style>