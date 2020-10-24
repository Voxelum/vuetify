import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
export const SelectingTimesProps = {
}
enum SelectingTimes {
  Hour = 1,
  Minute = 2,
  Second = 3
}

export { SelectingTimes }
