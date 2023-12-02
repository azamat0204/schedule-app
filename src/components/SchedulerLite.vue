<template>
    <div class="schedule" @dragover="disableDragendAnimation">
        <div>
            <div
                class="sc-rows"
                :style="{
                    width: state.settingData.titleDivW + '%',
                    height: state.contentH + 'px',
                }"
            >
                <div class="sc-rows-scroll" :style="{ width: '100%' }">
                    <div
                        v-for="(row, index) in scheduleData"
                        :key="index"
                        :class="'timeline title'"
                        :style="{
                            height: state.settingData.rowH + 'px',
                            'padding-top':
                                index == 0 ? state.padding + 'px' : '0px',
                        }"
                        @click="$emit('row-click-event', index, row.title)"
                    >
                        <span style="cursor: pointer">{{ row.title }}</span>
                    </div>
                </div>
            </div>
            <div
                class="sc-main-box"
                :style="{ width: 100 - state.settingData.titleDivW + '%' }"
            >
                <div
                    class="sc-main-scroll"
                    :style="{ width: getContentWidth(state.dateCnt) + 'px' }"
                >
                    <div class="sc-main">
                        <div
                            class="timeline"
                            :style="{
                                height: state.settingData.dateDivH + 'px',
                                background: 'black',
                            }"
                        >
                            <div
                                v-for="n in state.dateCnt"
                                :key="n"
                                class="sc-time"
                                :style="{
                                    width: getDateWidth(n - 1) + 'px',
                                    cursor: 'pointer',
                                }"
                                @click="
                                    $emit(
                                        'date-click-event',
                                        getHeaderDate(n - 1),
                                    )
                                "
                            >
                                {{ getHeaderDate(n - 1) }}
                            </div>
                        </div>
                        <div
                            class="timeline"
                            :style="{
                                height: state.settingData.timeDivH + 'px',
                                background: '#6187AE',
                            }"
                        >
                            <template
                                v-for="(n, index) in state.dateCnt"
                                :key="index"
                            >
                                <div
                                    v-for="count in getMonthsCount(n - 1)"
                                    :key="count"
                                    class="sc-time"
                                    :style="{
                                        width: state.timeDivW + 'px',
                                        height:
                                            state.settingData.timeDivH -
                                            8 +
                                            'px',
                                    }"
                                >
                                    {{ count }}
                                </div>
                            </template>
                        </div>

                        <div
                            v-for="(row, index) in scheduleData"
                            :key="index"
                            :class="'timeline'"
                            :style="{ height: state.settingData.rowH + 'px' }"
                            @dragenter="setDragenterRow(index)"
                        >
                            <unit-div
                                v-for="n in state.unitCnt"
                                :key="'unit' + n"
                                :row-index="index"
                                :key-index="n"
                                :row-data="row"
                                :is-business="isBusiness(index, n - 1)"
                                :is-selecting="state.isSelecting"
                                :is-selecting-row-index="
                                    state.isSelectingRowIndex
                                "
                                :width="state.settingData.unitDivW + 'px'"
                                @mouse-up="selectEndTime"
                                @set-dragenter-row-and-index="
                                    setDragenterRowAndIndex
                                "
                            >
                                <!--                @mouse-down="selectStartTime"-->
                                <!--                @mouse-enter="adjustTimeRange"-->
                            </unit-div>
                            <reserved-div
                                v-for="(detail, keyNo) in row.schedule"
                                :key="'res' + keyNo"
                                :schedule-detail="detail"
                                :row-index="index"
                                :key-no="keyNo"
                                :start-text="detail.start"
                                :end-text="detail.end"
                                :content-text="detail.text"
                                :unit-width="state.settingData.unitDivW"
                                :unit-height="state.settingData.rowH"
                                :title-div-width="state.settingData.titleDivW"
                                :border-width="state.settingData.borderW"
                                :min-date="state.settingData.startDate"
                                :max-date="state.settingData.endDate"
                                :unit="state.settingData.unit"
                                :clear-switch="state.clearSwitch"
                                :dragenter-row-index="state.dragenterRowIndex"
                                :dragenter-key-index="state.dragenterKeyIndex"
                                :is-selecting="state.isSelecting"
                                :is-selecting-row-index="
                                    state.isSelectingRowIndex
                                "
                                :is-selecting-index="state.isSelectingIndex"
                                @set-dragenter-row-and-index="
                                    setDragenterRowAndIndex
                                "
                                @move-schedule-data="moveScheduleData"
                                @edit-schedule-data="editScheduleData"
                                @delete-schedule-data="deleteScheduleData"
                                @mouse-up="selectEndTime"
                                @move-event="$emit('move-event')"
                                @edit-event="
                                    $emit(
                                        'edit-event',
                                        detail.start,
                                        detail.end,
                                    )
                                "
                                @click-event="
                                    $emit(
                                        'click-event',
                                        detail.start,
                                        detail.end,
                                        detail.text,
                                        detail.data,
                                    )
                                "
                            ></reserved-div>
                        </div>
                    </div>
                </div>
            </div>
            <br class="clear" />
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import { defineComponent, reactive, watch } from "vue";
import UnitDiv from "./UnitDev.vue";
import ReservedDiv from "./ReserveDiv.vue";
import moment from "moment"

export default defineComponent({
  name: "vue3-scheduler-lite",
  components: {
    "unit-div": UnitDiv,
    "reserved-div": ReservedDiv,
  },
  props: {
    scheduleData: {
      type: Array,
    },
    setting: {
      type: Object,
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      settingData: {
        startDate: "2020/04/20",
        endDate: "2020/04/26",
        unit: 60,
        borderW: 1,
        dateDivH: 25,
        timeDivH: 25,
        unitDivW: 25,
        titleDivW: 200,
        rowH: 135,
      },
      padding: 0,
      timeDivW: 0,
      dateDivW: 0,
      contentH: 0,
      contentW: 0,
      dateCnt: 0,
      unitCnt: 0,
      isSelecting: false,
      isSelectingRowIndex: null,
      isSelectingIndex: null,
      dragenterRowIndex: null,
      dragenterKeyIndex: null,
      clearSwitch: false,
    });

    const setDragenterRow = (rowIndex) => state.dragenterRowIndex = rowIndex;

    const setDragenterRowAndIndex = (rowIndex, currentIndex) => {
      state.dragenterRowIndex = rowIndex;
      state.dragenterKeyIndex = currentIndex;
    };

    const disableDragendAnimation = (e) => e.preventDefault()

    const getHeaderDate = (n) => moment(addMonths(new Date(state.settingData.startDate), n)).format('DD-MM-YYYY')
    const datetimeFormatter = (dateObj) => moment(dateObj).format('YYYY/MM/DD')

    const addMonths =(dateObj, n) => moment(dateObj).add(n, 'months').toDate()

    const addMinutes = (dateObj, n) => moment(dateObj).add(n, 'minutes').toDate()

    const isBusiness = (rowIndex, n) => {
      let noBusinessDate = props.scheduleData[rowIndex].noBusinessDate.map((businessDate) => moment(businessDate).format('YYYY-MM-DD'))
      const thisDate = getDateByIndex(n + 1)
      return noBusinessDate.indexOf(thisDate.format('YYYY-MM-DD')) < 0;
    };

    const isBusinessOnRange = (rowIndex, startDateText, endDateText) => {
      const settingsStartDate = moment(state.settingData.startDate)
      const startDateCount = moment(startDateText).diff(settingsStartDate, 'days')
      const endDateCount = moment(endDateText).diff(settingsStartDate, 'days')

      let result = true;
      for (let i = startDateCount; i < endDateCount; i++) {
        if (!isBusiness(rowIndex, i)) {
          result = false;
        }
      }
      return result;
    };

    const hasOtherEvent = (
        index,
        oldRowIndex,
        newRowIndex,
        startDateText,
        endDateText
    ) => {
      for (
          var n = 0;
          n < props.scheduleData[newRowIndex].schedule.length;
          n++
      ) {
        if (n != index || oldRowIndex != newRowIndex) {
          let diffData = props.scheduleData[newRowIndex].schedule[n];
          if (
              new Date(diffData.start) - new Date(startDateText) >= 0 &&
              new Date(diffData.end) - new Date(endDateText) <= 0
          ) {
            return true;
          }
          if (
              new Date(diffData.start) - new Date(startDateText) >= 0 &&
              new Date(diffData.start) - new Date(endDateText) < 0
          ) {
            return true;
          }
          if (
              new Date(diffData.start) - new Date(startDateText) <= 0 &&
              new Date(diffData.end) - new Date(startDateText) > 0
          ) {
            return true;
          }
        }
      }
      return false;
    };

    const getDateByIndex = (keyIndex) => {
      let month = 1
      let dayOfMonth = keyIndex

      for(let i = 0; i < state.dateCnt; i++){
        const daysInMonth = getMonthsCount(i);
        const theNextMonthDays = getMonthsCount(i + 1);

        if(dayOfMonth - theNextMonthDays < 0){
          break;
        }

        dayOfMonth = dayOfMonth - daysInMonth
        month++
      }

      return moment(state.settingData.startDate).add(month - 1, 'month').set('date', dayOfMonth)
    }

    const selectStartTime = (rowIndex, keyIndex) => {
      state.isSelecting = true;
      state.isSelectingRowIndex = rowIndex;

      const startDate = getDateByIndex(keyIndex)
      const endDate = moment(startDate).add(1, 'days')

      props.scheduleData[rowIndex].schedule.push({
        text: "New",
        start: datetimeFormatter(startDate.toDate()),
        end: datetimeFormatter(endDate.toDate()),
      });
      state.isSelectingIndex =
          props.scheduleData[state.isSelectingRowIndex].schedule.length - 1;
    };

    const adjustTimeRange = (keyIndex) => {
      let targetIndex =
          props.scheduleData[state.isSelectingRowIndex].schedule.length - 1;
      let targetData =
          props.scheduleData[state.isSelectingRowIndex].schedule[targetIndex];


      if (targetData) {
        const diff = moment(targetData.start).diff(moment(state.settingData.startDate), 'days') + 1
        let newEndDateText

        if(keyIndex > diff){
          newEndDateText = moment(targetData.start).add(keyIndex - diff, 'days').format('YYYY/MM/DD')
        }else{
          newEndDateText =  moment(targetData.start)
        }

        let isPermission = true;

        if (
            hasOtherEvent(
                targetIndex,
                state.isSelectingRowIndex,
                state.isSelectingRowIndex,
                targetData.start,
                newEndDateText
            )
        ) {
          isPermission = false;
        }

        if (isPermission) {
          isPermission = isBusinessOnRange(
              state.isSelectingRowIndex,
              targetData.start,
              newEndDateText
          );
        }
        if (isPermission) {
          targetData.end = newEndDateText;
        }
      }
    };

    const selectEndTime = (startDate, endDate) => {
      if (state.isSelecting) {
        if (startDate === undefined) {
          let targetData =
              props.scheduleData[state.isSelectingRowIndex].schedule[
              props.scheduleData[state.isSelectingRowIndex].schedule.length - 1
                  ];
          startDate = targetData.start;
          endDate = targetData.end;
        }
        emit("add-event", state.isSelectingRowIndex, startDate, endDate);
      }
      state.isSelecting = false;
      state.isSelectingRowIndex = null;
      state.isSelectingIndex = null;
      state.clearSwitch = !state.clearSwitch;
    };

    const moveScheduleData = (rowIndex, keyNo, unitCnt) => {
      let targetData = props.scheduleData[rowIndex].schedule[keyNo];
      if (targetData) {
        let status = 0;
        let isBusinessFlag = true;
        let isBusinessChecked = false;
        let changeDatetimeText = (datetimeText) => {
          const newDateObj = moment(datetimeText).add(unitCnt, 'days')
           return datetimeFormatter(newDateObj);
        };
        let newStartDatetime = changeDatetimeText(targetData.start);
        let newEndDatetime = changeDatetimeText(targetData.end);

        if (unitCnt !== 0) {
          if (
              hasOtherEvent(
                  keyNo,
                  rowIndex,
                  state.dragenterRowIndex,
                  newStartDatetime,
                  newEndDatetime
              )
          ) {
            status = 2;
          } else {
            isBusinessFlag = isBusinessOnRange(
                state.dragenterRowIndex,
                newStartDatetime,
                newEndDatetime
            );
            if (isBusinessFlag) {
              targetData.start = newStartDatetime;
              targetData.end = newEndDatetime;
              status = 1;
            }
            isBusinessChecked = true;
          }
        }
        if (
            rowIndex !== state.dragenterRowIndex &&
            props.scheduleData[state.dragenterRowIndex]
        ) {
          if (isBusinessChecked && !isBusinessFlag) {
            emit("move-event", status);
            return;
          }
          if (!isBusinessChecked && isBusinessFlag) {
            if (
                hasOtherEvent(
                    keyNo,
                    rowIndex,
                    state.dragenterRowIndex,
                    newStartDatetime,
                    newEndDatetime
                )
            ) {
              status = 2;
              emit("move-event", status);
              return;
            }
            isBusinessFlag = isBusinessOnRange(
                state.dragenterRowIndex,
                targetData.start,
                targetData.end
            );
            isBusinessChecked = true;
          }
          if (isBusinessChecked && isBusinessFlag) {
            props.scheduleData[state.dragenterRowIndex].schedule.push(
                targetData
            );
            props.scheduleData[rowIndex].schedule.splice(keyNo, 1);
            status = 1;
          }
        }
        emit("move-event", status, targetData.start, targetData.end);
      }
    };

    const editScheduleData = (rowIndex, keyNo, unitCnt) => {
      let targetData = props.scheduleData[rowIndex].schedule[keyNo];
      if (targetData) {
        let changeDatetimeText = (datetimeText) => {
          const newDateObj = moment(datetimeText).add(unitCnt - 1, 'days')
          return datetimeFormatter(newDateObj);
        };

        let newEndText = changeDatetimeText(targetData.end);
        if (
            hasOtherEvent(keyNo, rowIndex, rowIndex, targetData.start, newEndText)
        ) {
          return;
        }
        targetData.end = newEndText;
      }
    };

    const deleteScheduleData = (rowIndex, keyNo) => {
      emit("delete-event", rowIndex, keyNo);
    };

    const getUnitCounts = (dateCnt) => {
       let count = 0;

       for(let i = 0; i < dateCnt; i++){
         count += moment(addMonths(new Date(state.settingData.startDate), i)).daysInMonth()
       }

       return count
    }

    const getMonthsCount = (n) =>  moment(addMonths(state.settingData.startDate, n)).daysInMonth()

    const getDateWidth = (n) => state.settingData.unitDivW * getMonthsCount(n) + getMonthsCount(n) - state.settingData.borderW

    const getDateMonthDiff = (startDate, endDate) =>  moment(endDate).diff(moment(startDate), 'months', false)

    const getContentWidth = (dateCount) => {
      let contentWidth = 0;

      for(let i = 0; i < dateCount; i++){
        contentWidth += getDateWidth(i) + state.settingData.borderW;
      }

      return contentWidth
    }

    const initStateSettings = () => {
      state.settingData = Object.assign(state.settingData, props.setting);

      const count = getDateMonthDiff(state.settingData.startDate, state.settingData.endDate)
      state.dateCnt = isNaN(count) ? 6 : count + 1
      state.unitCnt = getUnitCounts(state.dateCnt)

      state.padding =
          state.settingData.dateDivH +
          state.settingData.timeDivH +
          state.settingData.borderW * 4;

      state.contentH =
          state.padding +
          (state.settingData.rowH + state.settingData.borderW * 2) *
          props.scheduleData.length;

      state.timeDivW =
          (60 / state.settingData.unit) *
          (state.settingData.unitDivW + state.settingData.borderW) -
          1;
    }

    watch(() => props.setting, initStateSettings, {
      immediate: true,
      deep: true
    })

    return {
      state,
      setDragenterRow,
      setDragenterRowAndIndex,
      disableDragendAnimation,
      getHeaderDate,
      datetimeFormatter,
      addMinutes,
      isBusiness,
      isBusinessOnRange,
      hasOtherEvent,
      selectStartTime,
      adjustTimeRange,
      selectEndTime,
      moveScheduleData,
      editScheduleData,
      deleteScheduleData,
      moment,
      addMonths,
      getMonthsCount,
      getDateWidth,
      getContentWidth,
      getUnitCounts
    };
  },
});
</script>

<style scoped>
.clear {
  clear: both;
  height: 0;
  line-height: 0;
}

.sc-rows {
  float: left;
  font-weight: bold;
  background: #6187ae;
  border-color: #c0c0c0;
  color: white;
  position: relative;
}

.sc-rows .title {
  background: #6187ae;
}

.sc-rows .sc-rows-scroll {
  position: absolute;
  left: 0;
  top: 0;
}

.sc-main-scroll .sc-time {
  color: #ffffff;
  padding: 4px 0;
  line-height: 18px;
  height: 18px;
  float: left;
  border-right: solid 1px #ccc;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sc-main-box {
  float: left;
  overflow-x: auto;
  overflow-y: auto;
}

.sc-main {
  position: relative;
  overflow: hidden;
}

.timeline {
  position: relative;
}

.sc-bar {
  position: absolute;
  color: #fff;
  background: #ff4800;
  cursor: pointer;
  z-index: 10;
  box-shadow: 2px 2px 4px #333;
  -moz-box-shadow: 2px 2px 4px #333;
  -webkit-box-shadow: 2px 2px 4px #333;
}

.ui-draggable-dragging,
.ui-resizeable {
  z-index: 20;
}

.timeline,
.sc-main .tb {
  border-bottom: solid 2px #666;
}

.sc-rows .timeline {
  overflow: hidden;
}

.sc-rows .timeline span {
  padding: 10px;
  display: block;
}

.sc-rows .timeline span.photo {
  float: left;
  width: 36px;
  height: 36px;
  padding: 10px 0 10px 10px;
}

.sc-rows .timeline span.title {
  float: left;
  padding: 10px 0 10px 10px;
  width: 92px;
}

.sc-main-scroll .sc-main .tl {
  float: left;
  height: 100%;
  border-right: solid 1px #ccc;
}

.sc-main-scroll .sc-main .tl:hover {
  background: #f0f0f0;
}

.sc-time {
  font-size: 10px;
}

.cant-res {
  background-color: #999 !important;
}

.isMe {
  background-color: #108000 !important;
}

.notMe {
  background-color: #ec920a !important;
}

/deep/ .sc-bar .head {
  display: block;
  padding: 6px 8px 0;
  font-size: 12px;
  height: 16px;
  overflow: hidden;
}

/deep/ .sc-bar .text {
  display: block;
  padding: 5px 15px 0;
  font-weight: bold;
  height: 18px;
  overflow: hidden;
}

/deep/ .resizable-e {
  cursor: e-resize;
  width: 10px;
  right: -5px;
  top: 0;
  height: 100%;
  z-index: 90;
  position: absolute;
  font-size: 0.1px;
  display: block;
}
</style>