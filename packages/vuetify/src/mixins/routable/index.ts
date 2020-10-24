import { VNodeData } from '@util/vnodeData'
import { computed, ExtractPropTypes, mergeProps, nextTick, PropType, reactive, ref, Ref, SetupContext, watch } from 'vue'
import { useRoute } from 'vue-router'
// Directives
import Ripple, { RippleOptions } from '../../directives/ripple'
// Utilities
import { getObjectValueByPath } from '../../util/helpers'

export const routableProps = {
  activeClass: String,
  append: Boolean,
  disabled: Boolean,
  exact: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  exactActiveClass: String,
  link: Boolean,
  href: [String, Object] as PropType<string | object>,
  to: [String, Object] as PropType<string | object>,
  nuxt: Boolean,
  replace: Boolean,
  ripple: {
    type: [Boolean, Object],
    default: null,
  },
  tag: String,
  target: String,
}

export const routableDirectives = {
  Ripple,
}

export default function useRoutable(props: ExtractPropTypes<typeof routableProps>, context: SetupContext) {
  const data = reactive({
    isActive: false,
    proxyClass: '',
  })
  props.href
  const classes: Ref<object> = computed(() => {
    const classes: Record<string, boolean> = {}

    if (props.to) return classes

    if (props.activeClass) classes[props.activeClass] = data.isActive
    if (data.proxyClass) classes[data.proxyClass] = data.isActive

    return classes
  })
  const link: Ref<Element | null> = ref(null)

  // TODO: inject router
  // const route = useRoute()
  const route = (useRoute || (() => { }))()
  if (route) {
    watch(() => route.params, onRouteChange)
  }

  const computedRipple: Ref<RippleOptions | boolean> = computed(() => {
    return props.ripple ?? (!props.disabled && isClickable.value)
  })
  const isClickable: Ref<boolean> = computed(() => {
    if (props.disabled) return false

    return Boolean(
      isLink.value ||
      context.attrs.onClick ||
      context.attrs.tabindex
    )
  })
  const isLink: Ref<boolean> = computed(() => {
    return !!props.to || !!props.href || props.link || false
  })
  const styles = computed(() => ({}));

  function click(e: MouseEvent): void {
    context.emit('click', e)
  }
  function generateRouteLink() {
    let exact = props.exact
    let tag

    let nodeProps: VNodeData = {
      tabindex: 'tabindex' in context.attrs ? context.attrs.tabindex : undefined,
      class: classes.value,
      style: styles.value,
      directives: [{
        name: 'ripple',
        value: computedRipple.value,
      }],
      onClick: click,
      ref: link,
      ...context.attrs,
    }

    if (typeof props.exact === 'undefined') {
      exact = props.to === '/' ||
        (props.to === Object(props.to) && props.to.path === '/')
    }

    if (props.to) {
      // Add a special activeClass hook
      // for component level styles
      let activeClass = props.activeClass
      let exactActiveClass = props.exactActiveClass || activeClass

      if (data.proxyClass) {
        activeClass = `${activeClass} ${data.proxyClass}`.trim()
        exactActiveClass = `${exactActiveClass} ${data.proxyClass}`.trim()
      }

      tag = props.nuxt ? 'nuxt-link' : 'router-link'

      nodeProps = mergeProps(nodeProps, {
        to: props.to,
        exact,
        activeClass,
        exactActiveClass,
        append: props.append,
        replace: props.replace,
      })
    } else {
      tag = (props.href && 'a') || props.tag || 'div'

      if (tag === 'a' && props.href) nodeProps!.href = props.href
    }

    if (props.target) nodeProps.target = props.target

    return { tag, data: nodeProps }
  }
  function onRouteChange() {
    if (!props.to || !link.value || !route.value) return
    const activeClass = `${props.activeClass} ${data.proxyClass || ''}`.trim()

    const path = `_vnode.data.class.${activeClass}`

    nextTick(() => {
      /* istanbul ignore else */
      if (getObjectValueByPath(link.value, path)) {
        toggle()
      }
    })
  }
  function toggle() { /* noop */ }
  return {
    classes,
    computedRipple,
    isClickable,
    isLink,
    styles,
    click,
    generateRouteLink,
    onRouteChange,
    toggle,
  }
}
