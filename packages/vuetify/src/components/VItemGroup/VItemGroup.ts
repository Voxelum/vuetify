import { useIsDestroyed } from '@composables/destroy';
import { computed, defineComponent, ExtractPropTypes, getCurrentInstance, h, nextTick, provide, reactive, Ref, SetupContext, watch } from 'vue';
// Mixins
import { GroupableInstance, GroupableKey } from '../../mixins/groupable';
import { proxyableProps, useProxyableFactory } from '../../mixins/proxyable';
// Types
import useThemeable, { themeableProps } from '../../mixins/themeable';
import { consoleWarn } from '../../util/console';
// Styles
import './VItemGroup.sass';

export const VItemGroupProps = {
  ...proxyableProps(),
  ...themeableProps,
  activeClass: {
    type: String,
    default: 'v-item--active',
  },
  mandatory: Boolean,
  max: {
    type: [Number, String],
    default: null,
  },
  multiple: Boolean,
}

const useProxyable = useProxyableFactory()

export function useVItemGroup(props: ExtractPropTypes<typeof VItemGroupProps>, context: SetupContext) {
  const { themeClasses } = useThemeable(props)
  const { internalValue } = useProxyable(props, context)
  const _isDestroyed = useIsDestroyed()
  const data = reactive({
    // As long as a value is defined, show it
    // Otherwise, check if multiple
    // to determine which default to provide
    internalLazyValue: props.value !== undefined
      ? props.value
      : props.multiple ? [] : undefined,
    items: [] as GroupableInstance[],
  })

  const classes: Ref<Record<string, boolean>> = computed(() => {
    return {
      'v-item-group': true,
      ...themeClasses.value,
    }
  })
  const selectedIndex: Ref<number> = computed(() => {
    return (selectedItem.value && data.items.indexOf(selectedItem.value)) || -1
  })
  const selectedItem: Ref<GroupableInstance | undefined> = computed(() => {
    if (props.multiple) return undefined

    return selectedItems.value[0]
  })
  const selectedItems: Ref<GroupableInstance[]> = computed(() => {
    return data.items.filter((item, index) => {
      return toggleMethod.value(getValue(item, index))
    })
  })
  const selectedValues: Ref<any[]> = computed(() => {
    if (internalValue.value == null) return []

    return Array.isArray(internalValue.value)
      ? internalValue.value
      : [internalValue.value]
  })
  const toggleMethod: Ref<(v: any) => boolean> = computed(() => {
    if (!props.multiple) {
      return (v: any) => internalValue.value === v
    }

    const _internalValue = internalValue.value
    if (Array.isArray(_internalValue)) {
      return (v: any) => _internalValue.includes(v)
    }

    return () => false
  })

  watch([() => internalValue.value,], updateItemsState)

  if (props.multiple && !Array.isArray(internalValue.value)) {
    consoleWarn('Model must be bound to an array if the multiple property is true.', context)
  }

  function genData(): object {
    return {
      class: classes.value,
    }
  }
  function getValue(item: GroupableInstance, i: number): unknown {
    return item.value == null || item.value === ''
      ? i
      : item.value
  }
  function onClick(item: GroupableInstance) {
    updateInternalValue(
      getValue(item, data.items.indexOf(item))
    )
  }
  function register(item: GroupableInstance) {
    const index = data.items.push(item) - 1

    item.$on('change', () => onClick(item))

    // If no value provided and mandatory,
    // assign first registered item
    if (props.mandatory && !selectedValues.value.length) {
      updateMandatory()
    }

    updateItem(item, index)
  }
  function unregister(item: GroupableInstance) {
    if (_isDestroyed.value) return

    const index = data.items.indexOf(item)
    const value = getValue(item, index)

    data.items.splice(index, 1)

    const valueIndex = selectedValues.value.indexOf(value)

    // Items is not selected, do nothing
    if (valueIndex < 0) return

    // If not mandatory, use regular update process
    if (!props.mandatory) {
      return updateInternalValue(value)
    }

    // Remove the value
    if (props.multiple && Array.isArray(internalValue.value)) {
      internalValue.value = internalValue.value.filter(v => v !== value)
    } else {
      internalValue.value = undefined
    }

    // If mandatory and we have no selection
    // add the last item as value
    /* istanbul ignore else */
    if (!selectedItems.value.length) {
      updateMandatory(true)
    }
  }
  function updateItem(item: GroupableInstance, index: number) {
    const value = getValue(item, index)

    item.isActive = toggleMethod.value(value)
  }
  // https://github.com/vuetifyjs/vuetify/issues/5352
  function updateItemsState() {
    nextTick(() => {
      if (props.mandatory &&
        !selectedItems.value.length
      ) {
        return updateMandatory()
      }

      // TODO: Make this smarter so it
      // doesn't have to iterate every
      // child in an update
      data.items.forEach(updateItem)
    })
  }
  function updateInternalValue(value: any) {
    props.multiple
      ? updateMultiple(value)
      : updateSingle(value)
  }
  function updateMandatory(last?: boolean) {
    if (!data.items.length) return

    const items = data.items.slice()

    if (last) items.reverse()

    const item = items.find(item => !item.disabled)

    // If no tabs are available
    // aborts mandatory value
    if (!item) return

    const index = data.items.indexOf(item)

    updateInternalValue(
      getValue(item, index)
    )
  }
  function updateMultiple(value: any) {
    const defaultValue = Array.isArray(internalValue.value)
      ? internalValue.value
      : []
    const _internalValue = defaultValue.slice()
    const index = _internalValue.findIndex(val => val === value)

    if (
      props.mandatory &&
      // Item already exists
      index > -1 &&
      // value would be reduced below min
      _internalValue.length - 1 < 1
    ) return

    if (
      // Max is set
      props.max != null &&
      // Item doesn't exist
      index < 0 &&
      // value would be increased above max
      _internalValue.length + 1 > props.max
    ) return

    index > -1
      ? _internalValue.splice(index, 1)
      : _internalValue.push(value)

    internalValue.value = _internalValue
  }
  function updateSingle(value: any) {
    const isSame = value === internalValue.value

    if (props.mandatory && isSame) return

    internalValue.value = isSame ? undefined : value
  }

  const result = {
    classes,
    selectedIndex,
    selectedItem,
    selectedItems,
    selectedValues,
    toggleMethod,
    genData,
    getValue,
    onClick,
    register,
    unregister,
    updateItem,
    updateItemsState,
    updateInternalValue,
    updateMandatory,
    updateMultiple,
    updateSingle,
  }

  provide(GroupableKey, result)

  return result
}

export default defineComponent({
  name: 'v-item-group',
  props: VItemGroupProps,
  setup(props, context) {
    const { genData } = useVItemGroup(props, context)
    return h('div', genData(), context.slots.default?.())
  }
})

