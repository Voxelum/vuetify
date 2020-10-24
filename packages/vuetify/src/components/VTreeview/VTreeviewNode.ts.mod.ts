import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Components
import { VExpandTransition } from '../transitions'
import { VIcon } from '../VIcon'
import VTreeview from './VTreeview'

// Mixins
import { inject as RegistrableInject } from '../../mixins/registrable'
import Colorable from '../../mixins/colorable'

// Utils
import mixins, { ExtractVue } from '../../util/mixins'
import { getObjectValueByPath, createRange } from '../../util/helpers'

// Types
import { VNode, VNodeChildren, PropType } from 'vue'
import { PropValidator } from 'vue/types/options'
export const VTreeviewNodeProps = {
    level: Number,
    item: {
      type: Object,
      default: () => null,
    } as PropValidator<Record<string, unknown> | null>,
    parentIsDisabled: Boolean,
    ...VTreeviewNodeProps,
}

type VTreeViewInstance = InstanceType<typeof VTreeview>

const baseMixins = mixins(
  Colorable,
  RegistrableInject('treeview')
)

interface options extends ExtractVue<typeof baseMixins> {
  treeview: VTreeViewInstance
}

export const VTreeviewNodeProps = {
  activatable: Boolean,
  activeClass: {
    type: String,
    default: 'v-treeview-node--active',
  },
  color: {
    type: String,
    default: 'primary',
  },
  expandIcon: {
    type: String,
    default: '$subgroup',
  },
  indeterminateIcon: {
    type: String,
    default: '$checkboxIndeterminate',
  },
  itemChildren: {
    type: String,
    default: 'children',
  },
  itemDisabled: {
    type: String,
    default: 'disabled',
  },
  itemKey: {
    type: String,
    default: 'id',
  },
  itemText: {
    type: String,
    default: 'name',
  },
  loadChildren: Function as PropType<(item: any) => Promise<void>>,
  loadingIcon: {
    type: String,
    default: '$loading',
  },
  offIcon: {
    type: String,
    default: '$checkboxOff',
  },
  onIcon: {
    type: String,
    default: '$checkboxOn',
  },
  openOnClick: Boolean,
  rounded: Boolean,
  selectable: Boolean,
  selectedColor: {
    type: String,
    default: 'accent',
  },
  shaped: Boolean,
  transition: Boolean,
  selectionType: {
    type: String as PropType<'leaf' | 'independent'>,
    default: 'leaf',
    validator: (v: string) => ['leaf', 'independent'].includes(v),
  },
}

/* @vue/component */
export function useVTreeviewNode(props: ExtractPropTypes<typeof VTreeviewNodeProps>, context: SetupContext) {



  const data = reactive({
    hasLoaded: false,
    isActive: false, // Node is selected (row)
    isIndeterminate: false, // Node has at least one selected child
    isLoading: false,
    isOpen: false, // Node is open/expanded
    isSelected: false, // Node is selected (checkbox)
  })

    const disabled: Ref<boolean> = computed(() => {
      return (
        getObjectValueByPath(props.item, props.itemDisabled) ||
        (props.parentIsDisabled && props.selectionType === 'leaf')
      )
    })
    const key: Ref<string> = computed(() => {
      return getObjectValueByPath(props.item, props.itemKey)
    })
    const children: Ref<any[] | null> = computed(() => {
      const children = getObjectValueByPath(props.item, props.itemChildren)
      return children && children.filter((child: any) => !props.treeview.isExcluded(getObjectValueByPath(child, props.itemKey)))
    })
    const text: Ref<string> = computed(() => {
      return getObjectValueByPath(props.item, props.itemText)
    })
    const scopedProps: Ref<object> = computed(() => {
      return {
        item: props.item,
        leaf: !children.value,
        selected: data.isSelected,
        indeterminate: data.isIndeterminate,
        active: data.isActive,
        open: data.isOpen,
      }
    })
    const computedIcon: Ref<string> = computed(() => {
      if (data.isIndeterminate) return props.indeterminateIcon
      else if (data.isSelected) return props.onIcon
      else return props.offIcon
    })
    const hasChildren: Ref<boolean> = computed(() => {
      return !!children.value && (!!children.value.length || !!props.loadChildren)
    })

    props.treeview.register(this)

  onBeforeUnmount(() => {
    props.treeview.unregister(this)
  })

  function checkChildren (): Promise<void> {
      return new Promise<void>(resolve => {
        // TODO: Potential issue with always trying
        // to load children if response is empty?
        if (!children.value || children.value.length || !props.loadChildren || data.hasLoaded) return resolve()

        data.isLoading = true
        resolve(props.loadChildren(props.item))
      }).then(() => {
        data.isLoading = false
        data.hasLoaded = true
      })
    }
  function open () {
      data.isOpen = !data.isOpen
      props.treeview.updateOpen(key.value, data.isOpen)
      props.treeview.emitOpen()
    }
  function genLabel () {
      const children = []

      if (context.scopedSlots.label) children.push(context.scopedSlots.label(scopedProps.value))
      else children.push(text.value)

      return context.createElement('div', {
        slot: 'label',
        staticClass: 'v-treeview-node__label',
      }, children)
    }
  function genPrependSlot () {
      if (!context.scopedSlots.prepend) return null

      return context.createElement('div', {
        staticClass: 'v-treeview-node__prepend',
      }, context.scopedSlots.prepend(scopedProps.value))
    }
  function genAppendSlot () {
      if (!context.scopedSlots.append) return null

      return context.createElement('div', {
        staticClass: 'v-treeview-node__append',
      }, context.scopedSlots.append(scopedProps.value))
    }
  function genContent () {
      const children = [
        genPrependSlot(),
        genLabel(),
        genAppendSlot(),
      ]

      return context.createElement('div', {
        staticClass: 'v-treeview-node__content',
      }, children)
    }
  function genToggle () {
      return context.createElement(VIcon, {
        staticClass: 'v-treeview-node__toggle',
        class: {
          'v-treeview-node__toggle--open': data.isOpen,
          'v-treeview-node__toggle--loading': data.isLoading,
        },
        slot: 'prepend',
        on: {
          click: (e: MouseEvent) => {
            e.stopPropagation()

            if (data.isLoading) return

            checkChildren().then(() => open())
          },
        },
      }, [data.isLoading ? props.loadingIcon : props.expandIcon])
    }
  function genCheckbox () {
      return context.createElement(VIcon, {
        staticClass: 'v-treeview-node__checkbox',
        props: {
          color: data.isSelected || data.isIndeterminate ? props.selectedColor : undefined,
          disabled: disabled.value,
        },
        on: {
          click: (e: MouseEvent) => {
            e.stopPropagation()

            if (data.isLoading) return

            checkChildren().then(() => {
              // We nextTick here so that items watch in VTreeview has a chance to run first
              context.nextTick(() => {
                data.isSelected = !data.isSelected
                data.isIndeterminate = false

                props.treeview.updateSelected(key.value, data.isSelected)
                props.treeview.emitSelected()
              })
            })
          },
        },
      }, [computedIcon.value])
    }
  function genLevel (level: number) {
      return createRange(level).map(() => context.createElement('div', {
        staticClass: 'v-treeview-node__level',
      }))
    }
  function genNode () {
      const children = [genContent()]

      if (props.selectable) children.unshift(genCheckbox())

      if (hasChildren.value) {
        children.unshift(genToggle())
      } else {
        children.unshift(...genLevel(1))
      }

      children.unshift(...genLevel(props.level))

      return context.createElement('div', props.setTextColor(data.isActive && props.color, {
        staticClass: 'v-treeview-node__root',
        class: {
          [props.activeClass]: data.isActive,
        },
        on: {
          click: () => {
            if (props.openOnClick && hasChildren.value) {
              checkChildren().then(open)
            } else if (props.activatable && !disabled.value) {
              data.isActive = !data.isActive
              props.treeview.updateActive(key.value, data.isActive)
              props.treeview.emitActive()
            }
          },
        },
      }), children)
    }
  function genChild (item: any, parentIsDisabled: boolean) {
      return context.createElement(VTreeviewNode, {
        key: getObjectValueByPath(item, props.itemKey),
        props: {
          activatable: props.activatable,
          activeClass: props.activeClass,
          item,
          selectable: props.selectable,
          selectedColor: props.selectedColor,
          color: props.color,
          expandIcon: props.expandIcon,
          indeterminateIcon: props.indeterminateIcon,
          offIcon: props.offIcon,
          onIcon: props.onIcon,
          loadingIcon: props.loadingIcon,
          itemKey: props.itemKey,
          itemText: props.itemText,
          itemDisabled: props.itemDisabled,
          itemChildren: props.itemChildren,
          loadChildren: props.loadChildren,
          transition: props.transition,
          openOnClick: props.openOnClick,
          rounded: props.rounded,
          shaped: props.shaped,
          level: props.level + 1,
          selectionType: props.selectionType,
          parentIsDisabled,
        },
        scopedSlots: context.scopedSlots,
      })
    }
  function genChildrenWrapper () {
      if (!data.isOpen || !children.value) return null

      const children = [children.value.map(c => genChild(c, disabled.value))]

      return context.createElement('div', {
        staticClass: 'v-treeview-node__children',
      }, children)
    }
  function genTransition () {
      return context.createElement(VExpandTransition, [genChildrenWrapper()])
    }

  return {
    disabled,
    key,
    children,
    text,
    scopedProps,
    computedIcon,
    hasChildren,
    checkChildren,
    open,
    genLabel,
    genPrependSlot,
    genAppendSlot,
    genContent,
    genToggle,
    genCheckbox,
    genLevel,
    genNode,
    genChild,
    genChildrenWrapper,
    genTransition,
  }
}
const VTreeviewNode = defineComponent({
  name: 'v-treeview-node',
  props: VTreeviewNodeProps,
  setup(props, context) {
    const {} = useVTreeviewNode(props, context)
    const children: VNodeChildren = [genNode()]

    if (props.transition) children.push(genTransition())
    else children.push(genChildrenWrapper())

    return h('div', {
      staticClass: 'v-treeview-node',
      class: {
        'v-treeview-node--leaf': !hasChildren.value,
        'v-treeview-node--click': props.openOnClick,
        'v-treeview-node--disabled': disabled.value,
        'v-treeview-node--rounded': props.rounded,
        'v-treeview-node--shaped': props.shaped,
        'v-treeview-node--selected': data.isSelected,
      },
      attrs: {
        'aria-expanded': String(data.isOpen),
      },
    }, children)
  },
})

export default VTreeviewNode

