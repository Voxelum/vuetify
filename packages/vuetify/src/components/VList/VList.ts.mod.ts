import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VList.sass'
import VListGroup from './VListGroup'

// Components
import VSheet from '../VSheet/VSheet'

// Types
import { VNode } from 'vue'
export const VListProps = {
  dense: Boolean,
  disabled: Boolean,
  expand: Boolean,
  flat: Boolean,
  nav: Boolean,
  rounded: Boolean,
  subheader: Boolean,
  threeLine: Boolean,
  twoLine: Boolean,
}

type VListGroupInstance = InstanceType<typeof VListGroup>

interface options extends InstanceType<typeof VSheet> {
  isInMenu: boolean
  isInNav: boolean
}

/* @vue/component */
export function useVList(props: ExtractPropTypes<typeof VListProps>, context: SetupContext) {
  const data = reactive({
    groups: [] as VListGroupInstance[],
  })

  const classes: Ref<object> = computed(() => {
    return {
      ...VSheet.options.computed.classes.call(this),
      'v-list--dense': props.dense,
      'v-list--disabled': props.disabled,
      'v-list--flat': props.flat,
      'v-list--nav': props.nav,
      'v-list--rounded': props.rounded,
      'v-list--subheader': props.subheader,
      'v-list--two-line': props.twoLine,
      'v-list--three-line': props.threeLine,
    }
  })

  function register(content: VListGroupInstance) {
    data.groups.push(content)
  }
  function unregister(content: VListGroupInstance) {
    const index = data.groups.findIndex(g => g._uid === content._uid)

    if (index > -1) data.groups.splice(index, 1)
  }
  function listClick(uid: number) {
    if (props.expand) return

    for (const group of data.groups) {
      group.toggle(uid)
    }
  }

  return {
    classes,
    register,
    unregister,
    listClick,
  }
}
const VList = defineComponent({
  name: 'v-list',
  props: VListProps,
  setup(props, context) {
    const { } = useVList(props, context)
    const data = {
      staticClass: 'v-list',
      class: classes.value,
      style: props.styles,
      attrs: {
        role: props.isInNav || props.isInMenu ? undefined : 'list',
        ...props.attrs$,
      },
    }

    return h(props.tag, props.setBackgroundColor(props.color, data), [context.slots.default])
  },
})

export default VList

