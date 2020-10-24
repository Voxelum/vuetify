import { useIsDestroyed } from '@composables/destroy'
import useBootable from '@mixins/bootable/index.ts'
import { ExtractPropTypes, nextTick, onBeforeUnmount, onMounted, PropType, reactive, Ref, ref, SetupContext, VNode, watch } from 'vue'
import { consoleWarn } from '../../util/console'
// Utilities
import { getObjectValueByPath } from '../../util/helpers'

export const detachableProps = {
  attach: {
    default: false,
    validator: validateAttachTarget,
  } as any as PropType<boolean | string | Element>,
  contentClass: {
    type: String,
    default: '',
  },
}

function validateAttachTarget(val: any) {
  const type = typeof val

  if (type === 'boolean' || type === 'string') return true

  return val.nodeType === Node.ELEMENT_NODE
}

/* @vue/component */
export function useDetachable(props: ExtractPropTypes<typeof detachableProps>, context: SetupContext) {
  const { hasContent } = useBootable(props, context)
  const content: Ref<HTMLElement | null> = ref(null)
  const _isDestroyed = useIsDestroyed()
  const data = reactive({
    activatorNode: null as null | VNode | VNode[],
    hasDetached: false,
  })

  watch(() => props.attach, () => {
    data.hasDetached = false
    initDetach()
  })
  watch(hasContent, () => {
    nextTick(initDetach)
  })

  onMounted(() => {
    hasContent.value && initDetach()
  })

  onBeforeUnmount(() => {
    // IE11 Fix
    
    // vue 3 not support IE11
    // try {
    //   if (
    //     content.value &&
    //     content.value.parentNode
    //   ) {
    //     content.value.parentNode.removeChild(content.value)
    //   }

    //   if (data.activatorNode) {
    //     const activator = Array.isArray(data.activatorNode) ? data.activatorNode : [data.activatorNode]
    //     activator.forEach(node => {
    //       node.elm &&
    //         node.elm.parentNode &&
    //         node.elm.parentNode.removeChild(node.elm)
    //     })
    //   }
    // } catch (e) { console.log(e) }
  })

  function getScopeIdAttrs() {
    const scopeId = getObjectValueByPath(context.vnode, 'context.$options._scopeId')

    return scopeId && {
      [scopeId]: '',
    }
  }
  function initDetach() {
    if (_isDestroyed.value ||
      !content.value ||
      data.hasDetached ||
      // Leave menu in place if attached
      // and dev has not changed target
      props.attach === '' || // If used as a boolean prop (<v-menu attach>)
      props.attach === true || // If bound to a boolean (<v-menu :attach="true">)
      props.attach === 'attach' // If bound as boolean prop in pug (v-menu(attach))
    ) return

    let target
    if (props.attach === false) {
      // Default, detach to app
      target = document.querySelector('[data-app]')
    } else if (typeof props.attach === 'string') {
      // CSS selector
      target = document.querySelector(props.attach)
    } else {
      // DOM Element
      target = props.attach
    }

    if (!target) {
      consoleWarn(`Unable to locate target ${props.attach || '[data-app]'}`, context)
      return
    }

    target.appendChild(content.value)

    data.hasDetached = true
  }
  return {
    getScopeIdAttrs,
    initDetach,
  }
}
