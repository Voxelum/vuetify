import Intersect from '@directives/intersect'
import { useVuetify } from '@framework'
import { computed, defineComponent, ExtractPropTypes, getCurrentInstance, h, mergeProps, nextTick, onMounted, reactive, Ref, SetupContext, VNode, VNodeArrayChildren, watch, withDirectives } from 'vue'
// Directives
import Resize from '../../directives/resize'
// Mixins
import { backgroundColor, colorableProps } from '../../mixins/colorable'
import useThemeable, { themeableProps } from '../../mixins/themeable'
import VIcon from '../VIcon'
import './VPagination.sass'

export const VPaginationProps = {
  ...themeableProps,
  ...colorableProps,
  circle: Boolean,
  disabled: Boolean,
  length: {
    type: Number,
    default: 0,
    validator: (val: number) => val % 1 === 0,
  },
  nextIcon: {
    type: String,
    default: '$next',
  },
  prevIcon: {
    type: String,
    default: '$prev',
  },
  totalVisible: [Number, String],
  value: {
    type: Number,
    default: 0,
  },
  pageAriaLabel: {
    type: String,
    default: '$vuetify.pagination.ariaLabel.page',
  },
  currentPageAriaLabel: {
    type: String,
    default: '$vuetify.pagination.ariaLabel.currentPage',
  },
  previousAriaLabel: {
    type: String,
    default: '$vuetify.pagination.ariaLabel.previous',
  },
  nextAriaLabel: {
    type: String,
    default: '$vuetify.pagination.ariaLabel.next',
  },
  wrapperAriaLabel: {
    type: String,
    default: '$vuetify.pagination.ariaLabel.wrapper',
  },
}

/* @vue/component */
// Intersectable({ onVisible: ['init'] }),
// Themeable
export function useVPagination(props: ExtractPropTypes<typeof VPaginationProps>, context: SetupContext) {
  const { themeClasses } = useThemeable(props)
  const vuetify = useVuetify()
  const data = reactive({
    maxButtons: 0,
    selected: null as number | null,
  })

  const classes: Ref<object> = computed(() => {
    return {
      'v-pagination': true,
      'v-pagination--circle': props.circle,
      'v-pagination--disabled': props.disabled,
      ...themeClasses.value,
    }
  })

  const items: Ref<(string | number)[]> = computed(() => {
    const totalVisible = parseInt(props.totalVisible ?? 0, 10)

    const maxLength = Math.min(
      Math.max(0, totalVisible) || props.length,
      Math.max(0, data.maxButtons) || props.length,
      props.length
    )

    if (props.length <= maxLength) {
      return range(1, props.length)
    }

    const even = maxLength % 2 === 0 ? 1 : 0
    const left = Math.floor(maxLength / 2)
    const right = props.length - left + 1 + even

    if (props.value > left && props.value < right) {
      const start = props.value - left + 2
      const end = props.value + left - 2 - even

      return [1, '...', ...range(start, end), '...', props.length]
    } else if (props.value === left) {
      const end = props.value + left - 1 - even
      return [...range(1, end), '...', props.length]
    } else if (props.value === right) {
      const start = props.value - left + 1
      return [1, '...', ...range(start, props.length)]
    } else {
      return [
        ...range(1, left),
        '...',
        ...range(right, props.length),
      ]
    }
  })

  watch(() => props.value, () => {
    init()
  })

  onMounted(() => {
    init()
  })

  function init() {
    data.selected = null

    nextTick(onResize)
    // TODO: Change this (f75dee3a, cbdf7caa)
    setTimeout(() => (data.selected = props.value), 100)
  }
  function onResize() {
    const inst = getCurrentInstance()!
    const el = inst.vnode.el!
    const width = el && el.parentElement
      ? el.parentElement.clientWidth
      : window.innerWidth

    data.maxButtons = Math.floor((width - 96) / 42)
  }
  function next(e: Event) {
    e.preventDefault()
    context.emit('input', props.value + 1)
    context.emit('next')
  }
  function previous(e: Event) {
    e.preventDefault()
    context.emit('input', props.value - 1)
    context.emit('previous')
  }
  function range(from: number, to: number) {
    const range = []

    from = from > 0 ? from : 1

    for (let i = from; i <= to; i++) {
      range.push(i)
    }

    return range
  }
  function genIcon(icon: string, disabled: boolean, fn: EventListener, label: String): VNode {
    return h('li', [
      h('button', {
        class: {
          'v-pagination__navigation': true,
          'v-pagination__navigation--disabled': disabled,
        },
        type: 'button',
        'aria-label': label,
        onClick: disabled ? undefined : fn,
      }, [h(VIcon, [icon])]),
    ])
  }
  function genItem(i: string | number): VNode {
    const color: string | false = (i === props.value) && (props.color || 'primary')
    const isCurrentPage = i === props.value
    const ariaLabel = isCurrentPage ? props.currentPageAriaLabel : props.pageAriaLabel

    return h('button', mergeProps(backgroundColor(color), {
      class: {
        'v-pagination__item': true,
        'v-pagination__item--active': i === props.value,
      },
      type: 'button',
      'aria-current': isCurrentPage,
      'aria-label': vuetify.lang.t(ariaLabel, i),
      onClick: () => context.emit('input', i),
    }), [i.toString()])
  }
  function genItems(): VNode[] {
    return items.value.map((i, index) => {
      return h('li', { key: index }, [
        isNaN(Number(i)) ? h('span', { class: 'v-pagination__more' }, [i.toString()]) : genItem(i),
      ])
    })
  }
  function genList(children: VNodeArrayChildren): VNode {
    return withDirectives(h('ul', {
      class: classes.value,
    }, children), [[Resize, onResize, '', { quiet: true }]])
  }

  return {
    classes,
    items,
    init,
    onResize,
    next,
    previous,
    range,
    genIcon,
    genItem,
    genItems,
    genList,
  }
}
const VPagination = defineComponent({
  name: 'v-pagination',
  props: VPaginationProps,
  setup(props, context) {
    const vuetify = useVuetify()
    const { genIcon, genItems, genList, previous, next } = useVPagination(props, context)
    return () => {
      const children = [
        genIcon(
          vuetify.rtl ? props.nextIcon : props.prevIcon,
          props.value <= 1,
          previous,
          vuetify.lang.t(props.previousAriaLabel)),
        genItems(),
        genIcon(
          vuetify.rtl ? props.prevIcon : props.nextIcon,
          props.value >= props.length,
          next,
          vuetify.lang.t(props.nextAriaLabel)),
      ]

      return withDirectives(h('nav', {
        role: 'navigation',
        'aria-label': vuetify.lang.t(props.wrapperAriaLabel),
      }, [genList(children)]), [[Resize], [Intersect, { onVisible: ['init'] }]])
    }
  },
})

export default VPagination

