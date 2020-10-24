import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import './VTimePickerTitle.sass'

// Mixins
import PickerButton from '../../mixins/picker-button'

// Utils
import { pad } from '../VDatePicker/util'
import mixins from '../../util/mixins'

import { SelectingTimes } from './SelectingTimes'
import { VNode, PropType } from 'vue'
export const VTimePickerTitleProps = {
    ampm: Boolean,
    ampmReadonly: Boolean,
    disabled: Boolean,
    hour: Number,
    minute: Number,
    second: Number,
    period: {
      type: String as PropType<'am' | 'pm'>,
      validator: period => period === 'am' || period === 'pm',
    },
    readonly: Boolean,
    useSeconds: Boolean,
    selecting: Number,
}

  PickerButton
/* @vue/component */
export function useVTimePickerTitle(props: ExtractPropTypes<typeof VTimePickerTitleProps>, context: SetupContext) {


  function genTime () {
      let hour = props.hour
      if (props.ampm) {
        hour = hour ? ((hour - 1) % 12 + 1) : 12
      }

      const displayedHour = props.hour == null ? '--' : props.ampm ? String(hour) : pad(hour)
      const displayedMinute = props.minute == null ? '--' : pad(props.minute)
      const titleContent = [
        props.genPickerButton('selecting', SelectingTimes.Hour, displayedHour, props.disabled),
        context.createElement('span', ':'),
        props.genPickerButton('selecting', SelectingTimes.Minute, displayedMinute, props.disabled),
      ]

      if (props.useSeconds) {
        const displayedSecond = props.second == null ? '--' : pad(props.second)
        titleContent.push(context.createElement('span', ':'))
        titleContent.push(props.genPickerButton('selecting', SelectingTimes.Second, displayedSecond, props.disabled))
      }
      return context.createElement('div', {
        class: 'v-time-picker-title__time',
      }, titleContent)
    }
  function genAmPm () {
      return context.createElement('div', {
        staticClass: 'v-time-picker-title__ampm',
        class: {
          'v-time-picker-title__ampm--readonly': props.ampmReadonly,
        },
      }, [
        (!props.ampmReadonly || props.period === 'am') ? props.genPickerButton('period', 'am', context.vuetify.lang.t('$vuetify.timePicker.am'), props.disabled || props.readonly) : null,
        (!props.ampmReadonly || props.period === 'pm') ? props.genPickerButton('period', 'pm', context.vuetify.lang.t('$vuetify.timePicker.pm'), props.disabled || props.readonly) : null,
      ])
    }

  return {
    genTime,
    genAmPm,
  }
}
const VTimePickerTitle = defineComponent({
  name: 'v-time-picker-title',
  props: VTimePickerTitleProps,
  setup(props, context) {
    const {} = useVTimePickerTitle(props, context)
    const children = [genTime()]

    props.ampm && children.push(genAmPm())

    return h('div', {
      staticClass: 'v-time-picker-title',
    }, children)
  },
})

export default VTimePickerTitle

