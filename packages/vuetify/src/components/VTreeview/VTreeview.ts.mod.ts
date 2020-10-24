import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VTreeview.sass'

// Types
import { VNode, VNodeChildrenArrayContents, PropType } from 'vue'
import { PropValidator } from 'vue/types/options'
import { TreeviewItemFunction } from 'vuetify/types'

// Components
import VTreeviewNode, { VTreeviewNodeProps } from './VTreeviewNode'

// Mixins
import Themeable from '../../mixins/themeable'
import { provide as RegistrableProvide } from '../../mixins/registrable'

// Utils
import {
  arrayDiff,
  deepEqual,
  getObjectValueByPath,
} from '../../util/helpers'
import mixins from '../../util/mixins'
import { consoleWarn } from '../../util/console'
import {
export const VTreeviewProps = {
    active: {
      type: Array,
      default: () => ([]),
    } as PropValidator<NodeArray>,
    dense: Boolean,
    filter: Function as PropType<TreeviewItemFunction>,
    hoverable: Boolean,
    items: {
      type: Array,
      default: () => ([]),
    } as PropValidator<any[]>,
    multipleActive: Boolean,
    open: {
      type: Array,
      default: () => ([]),
    } as PropValidator<NodeArray>,
    openAll: Boolean,
    returnObject: {
      type: Boolean,
      default: false, // TODO: Should be true in next major
    },
    search: String,
    value: {
      type: Array,
      default: () => ([]),
    } as PropValidator<NodeArray>,
    ...VTreeviewNodeProps,
}
  filterTreeItems,
  filterTreeItem,
} from './util/filterTreeItems'

type VTreeviewNodeInstance = InstanceType<typeof VTreeviewNode>

type NodeCache = Set<string | number>
type NodeArray = (string | number)[]

type NodeState = {
  parent: number | string | null
  children: (number | string)[]
  vnode: VTreeviewNodeInstance | null
  isActive: boolean
  isSelected: boolean
  isIndeterminate: boolean
  isOpen: boolean
  item: any
}

  RegistrableProvide('treeview'),
  Themeable
  /* @vue/component */
export function useVTreeview(props: ExtractPropTypes<typeof VTreeviewProps>, context: SetupContext) {



  const data = reactive({
    level: -1,
    activeCache: new Set() as NodeCache,
    nodes: {} as Record<string | number, NodeState>,
    openCache: new Set() as NodeCache,
    selectedCache: new Set() as NodeCache,
  })

    const excludedItems: Ref<Set<string | number>> = computed(() => {
      const excluded = new Set<string|number>()

      if (!props.search) return excluded

      for (let i = 0; i < props.items.length; i++) {
        filterTreeItems(
          props.filter || filterTreeItem,
          props.items[i],
          props.search,
          props.itemKey,
          props.itemText,
          props.itemChildren,
          excluded
        )
      }

      return excluded
    })

watch(() => props.items, () => {
        const oldKeys = Object.keys(data.nodes).map(k => getObjectValueByPath(data.nodes[k].item, props.itemKey))
        const newKeys = getKeys(props.items)
        const diff = arrayDiff(newKeys, oldKeys)
{
      deep: true,
})
watch(() => props.active, (value: (string | number | any) => {
      handleNodeCacheWatcher(value, data.activeCache, updateActive, emitActive)
})
watch(props, (value: (string | number | any) => {
      handleNodeCacheWatcher(value, data.selectedCache, updateSelected, emitSelected)
})
watch(() => props.open, (value: (string | number | any) => {
      handleNodeCacheWatcher(value, data.openCache, updateOpen, emitOpen)
})

    const getValue = (key: string | number) => props.returnObject ? getObjectValueByPath(key, props.itemKey) : key

    buildTree(props.items)

    for (const value of props.value.map(getValue)) {
      updateSelected(value, true, true)
    }

    for (const active of props.active.map(getValue)) {
      updateActive(active, true)
    }

  onMounted(() => {
    // Save the developer from themselves
    if (context.slots.prepend || context.slots.append) {
      consoleWarn('The prepend and append slots require a slot-scope attribute', this)
    }

    if (props.openAll) {
      updateAll(true)
    } else {
      props.open.forEach(key => updateOpen(props.returnObject ? getObjectValueByPath(key, props.itemKey) : key, true))
      emitOpen()
    }
  })

    /** @public */
  function updateAll (value: boolean) {
      Object.keys(data.nodes).forEach(key => updateOpen(getObjectValueByPath(data.nodes[key].item, props.itemKey), value))
      emitOpen()
    }
  function getKeys (items: any[], keys: any[] = []) {
      for (let i = 0; i < items.length; i++) {
        const key = getObjectValueByPath(items[i], props.itemKey)
        keys.push(key)
        const children = getObjectValueByPath(items[i], props.itemChildren)
        if (children) {
          keys.push(...getKeys(children))
        }
      }

      return keys
    }
  function buildTree (items: any[], parent: (string | number | null) = null) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const key = getObjectValueByPath(item, props.itemKey)
        const children = getObjectValueByPath(item, props.itemChildren, [])
        const oldNode = data.nodes.hasOwnProperty(key) ? data.nodes[key] : {
          isSelected: false, isIndeterminate: false, isActive: false, isOpen: false, vnode: null,
        } as NodeState

        const node: any = {
          vnode: oldNode.vnode,
          parent,
          children: children.map((c: any) => getObjectValueByPath(c, props.itemKey)),
          item,
        }

        buildTree(children, key)

        // This fixed bug with dynamic children resetting selected parent state
        if (!data.nodes.hasOwnProperty(key) && parent !== null && data.nodes.hasOwnProperty(parent)) {
          node.isSelected = data.nodes[parent].isSelected
        } else {
          node.isSelected = oldNode.isSelected
          node.isIndeterminate = oldNode.isIndeterminate
        }

        node.isActive = oldNode.isActive
        node.isOpen = oldNode.isOpen

        data.nodes[key] = node

        if (children.length) {
          const { isSelected, isIndeterminate } = calculateState(key, data.nodes)

          node.isSelected = isSelected
          node.isIndeterminate = isIndeterminate
        }

        // Don't forget to rebuild cache
        if (data.nodes[key].isSelected && (props.selectionType === 'independent' || node.children.length === 0)) data.selectedCache.add(key)
        if (data.nodes[key].isActive) data.activeCache.add(key)
        if (data.nodes[key].isOpen) data.openCache.add(key)

        updateVnodeState(key)
      }
    }
  function calculateState (node: string | number, state: Record<string | number, NodeState>) {
      const children = state[node].children
      const counts = children.reduce((counts: number[], child: string | number) => {
        counts[0] += +Boolean(state[child].isSelected)
        counts[1] += +Boolean(state[child].isIndeterminate)

        return counts
      }, [0, 0])

      const isSelected = !!children.length && counts[0] === children.length
      const isIndeterminate = !isSelected && (counts[0] > 0 || counts[1] > 0)

      return {
        isSelected,
        isIndeterminate,
      }
    }
  function emitOpen () {
      emitNodeCache('update:open', data.openCache)
    }
  function emitSelected () {
      emitNodeCache('input', data.selectedCache)
    }
  function emitActive () {
      emitNodeCache('update:active', data.activeCache)
    }
  function emitNodeCache (event: string, cache: NodeCache) {
      context.emit(event, props.returnObject ? [...cache].map(key => data.nodes[key].item) : [...cache])
    }
  function handleNodeCacheWatcher (value: any[], cache: NodeCache, updateFn: Function, emitFn: Function) {
      value = props.returnObject ? value.map(v => getObjectValueByPath(v, props.itemKey)) : value
      const old = [...cache]
      if (deepEqual(old, value)) return

      old.forEach(key => updateFn(key, false))
      value.forEach(key => updateFn(key, true))

      emitFn()
    }
  function getDescendants (key: string | number, descendants: NodeArray = []) {
      const children = data.nodes[key].children

      descendants.push(...children)

      for (let i = 0; i < children.length; i++) {
        descendants = getDescendants(children[i], descendants)
      }

      return descendants
    }
  function getParents (key: string | number) {
      let parent = data.nodes[key].parent

      const parents = []
      while (parent !== null) {
        parents.push(parent)
        parent = data.nodes[parent].parent
      }

      return parents
    }
  function register (node: VTreeviewNodeInstance) {
      const key = getObjectValueByPath(node.item, props.itemKey)
      data.nodes[key].vnode = node

      updateVnodeState(key)
    }
  function unregister (node: VTreeviewNodeInstance) {
      const key = getObjectValueByPath(node.item, props.itemKey)
      if (data.nodes[key]) data.nodes[key].vnode = null
    }
  function isParent (key: string | number) {
      return data.nodes[key].children && data.nodes[key].children.length
    }
  function updateActive (key: string | number, isActive: boolean) {
      if (!data.nodes.hasOwnProperty(key)) return

      if (!props.multipleActive) {
        data.activeCache.forEach(active => {
          data.nodes[active].isActive = false
          updateVnodeState(active)
          data.activeCache.delete(active)
        })
      }

      const node = data.nodes[key]
      if (!node) return

      if (isActive) data.activeCache.add(key)
      else data.activeCache.delete(key)

      node.isActive = isActive

      updateVnodeState(key)
    }
  function updateSelected (key: string | number, isSelected: boolean, isForced = false) {
      if (!data.nodes.hasOwnProperty(key)) return

      const changed = new Map()

      if (props.selectionType !== 'independent') {
        for (const descendant of getDescendants(key)) {
          if (!getObjectValueByPath(data.nodes[descendant].item, props.itemDisabled) || isForced) {
            data.nodes[descendant].isSelected = isSelected
            data.nodes[descendant].isIndeterminate = false
            changed.set(descendant, isSelected)
          }
        }

        const calculated = calculateState(key, data.nodes)
        data.nodes[key].isSelected = isSelected
        data.nodes[key].isIndeterminate = calculated.isIndeterminate
        changed.set(key, isSelected)

        for (const parent of getParents(key)) {
          const calculated = calculateState(parent, data.nodes)
          data.nodes[parent].isSelected = calculated.isSelected
          data.nodes[parent].isIndeterminate = calculated.isIndeterminate
          changed.set(parent, calculated.isSelected)
        }
      } else {
        data.nodes[key].isSelected = isSelected
        data.nodes[key].isIndeterminate = false
        changed.set(key, isSelected)
      }

      for (const [key, value] of changed.entries()) {
        updateVnodeState(key)

        if (props.selectionType === 'leaf' && isParent(key)) continue

        value === true ? data.selectedCache.add(key) : data.selectedCache.delete(key)
      }
    }
  function updateOpen (key: string | number, isOpen: boolean) {
      if (!data.nodes.hasOwnProperty(key)) return

      const node = data.nodes[key]
      const children = getObjectValueByPath(node.item, props.itemChildren)

      if (children && !children.length && node.vnode && !node.vnode.hasLoaded) {
        node.vnode.checkChildren().then(() => updateOpen(key, isOpen))
      } else if (children && children.length) {
        node.isOpen = isOpen

        node.isOpen ? data.openCache.add(key) : data.openCache.delete(key)

        updateVnodeState(key)
      }
    }
  function updateVnodeState (key: string | number) {
      const node = data.nodes[key]

      if (node && node.vnode) {
        node.vnode.isSelected = node.isSelected
        node.vnode.isIndeterminate = node.isIndeterminate
        node.vnode.isActive = node.isActive
        node.vnode.isOpen = node.isOpen
      }
    }
  function isExcluded (key: string | number) {
      return !!props.search && excludedItems.value.has(key)
    }

  return {
    excludedItems,
    updateAll,
    getKeys,
    buildTree,
    calculateState,
    emitOpen,
    emitSelected,
    emitActive,
    emitNodeCache,
    handleNodeCacheWatcher,
    getDescendants,
    getParents,
    register,
    unregister,
    isParent,
    updateActive,
    updateSelected,
    updateOpen,
    updateVnodeState,
    isExcluded,
  }
}
const VTreeview = defineComponent({
  name: 'v-treeview',
  props: VTreeviewProps,
  setup(props, context) {
    const {} = useVTreeview(props, context)
    const children: VNodeChildrenArrayContents = props.items.length
      ? props.items.map(item => {
        const genChild = VTreeviewNode.options.methods.genChild.bind(this)

        return genChild(item, getObjectValueByPath(item, props.itemDisabled))
      })
      /* istanbul ignore next */
      : context.slots.default! // TODO: remove type annotation with TS 3.2

    return h('div', {
      staticClass: 'v-treeview',
      class: {
        'v-treeview--hoverable': props.hoverable,
        'v-treeview--dense': props.dense,
        ...props.themeClasses,
      },
    }, children)
  },
})

export default VTreeview

