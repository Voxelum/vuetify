import { useVuetify } from '@framework'
import { computed, defineComponent, ExtractPropTypes, h, PropType, reactive, Ref, SetupContext, toRefs } from 'vue'
import { breaking } from '../../util/console'
// Utilities
import { convertToUnit, getSlot } from '../../util/helpers'
// Components
import VImg, { srcObject } from '../VImg/VImg'
// Extensions
import { useVSheet, VSheetProps } from '../VSheet/VSheet'
// Styles
import './VToolbar.sass'

export const VToolbarProps = {
  ...VSheetProps,
  absolute: Boolean,
  bottom: Boolean,
  collapse: Boolean,
  dense: Boolean,
  extended: Boolean,
  extensionHeight: {
    default: 48,
    type: [Number, String],
  },
  flat: Boolean,
  floating: Boolean,
  prominent: Boolean,
  short: Boolean,
  src: {
    type: [String, Object] as PropType<string | srcObject>,
    default: '',
  },
  tag: {
    type: String,
    default: 'header',
  },
}

/* @vue/component */
export function useVToolbar(props: ExtractPropTypes<typeof VToolbarProps>, context: SetupContext) {
  const { measurableStyles, setBackgroundColor, classes: sheetClasses } = useVSheet(props, context)
  const vuetify = useVuetify()

  const data = reactive({
    isExtended: false,
  })

  const computedHeight: Ref<number> = computed(() => {
    const height = computedContentHeight.value

    if (!data.isExtended) return height

    const extensionHeight = parseInt(props.extensionHeight)

    return isCollapsed.value
      ? height
      : height + (!isNaN(extensionHeight) ? extensionHeight : 0)
  })
  const computedContentHeight: Ref<number> = computed(() => {
    if (props.height) return parseInt(props.height)
    if (isProminent.value && props.dense) return 96
    if (isProminent.value && props.short) return 112
    if (isProminent.value) return 128
    if (props.dense) return 48
    if (props.short || vuetify.breakpoint.smAndDown) return 56
    return 64
  })
  const classes: Ref<object> = computed(() => {
    return {
      ...sheetClasses.value,
      'v-toolbar': true,
      'v-toolbar--absolute': props.absolute,
      'v-toolbar--bottom': props.bottom,
      'v-toolbar--collapse': props.collapse,
      'v-toolbar--collapsed': isCollapsed.value,
      'v-toolbar--dense': props.dense,
      'v-toolbar--extended': data.isExtended,
      'v-toolbar--flat': props.flat,
      'v-toolbar--floating': props.floating,
      'v-toolbar--prominent': isProminent.value,
    }
  })
  const isCollapsed: Ref<boolean> = computed(() => {
    return props.collapse ?? false
  })
  const isProminent: Ref<boolean> = computed(() => {
    return props.prominent ?? false
  })
  const styles: Ref<object> = computed(() => {
    return {
      ...measurableStyles.value,
      height: convertToUnit(computedHeight.value),
    }
  })

  const breakingProps = [
    ['app', '<v-app-bar app>'],
    ['manual-scroll', '<v-app-bar :value="false">'],
    ['clipped-left', '<v-app-bar clipped-left>'],
    ['clipped-right', '<v-app-bar clipped-right>'],
    ['inverted-scroll', '<v-app-bar inverted-scroll>'],
    ['scroll-off-screen', '<v-app-bar scroll-off-screen>'],
    ['scroll-target', '<v-app-bar scroll-target>'],
    ['scroll-threshold', '<v-app-bar scroll-threshold>'],
    ['card', '<v-app-bar flat>'],
  ]

  /* istanbul ignore next */
  breakingProps.forEach(([original, replacement]) => {
    if (context.attrs.hasOwnProperty(original)) breaking(original, replacement, context)
  })

  function genBackground() {
    const _props = {
      height: convertToUnit(computedHeight.value),
      src: props.src,
    }

    const image = context.slots.img
      ? context.slots.img({ props: _props })
      : h(VImg, { props: _props })

    return h('div', {
      staticClass: 'v-toolbar__image',
    }, [image])
  }
  function genContent() {
    return h('div', {
      staticClass: 'v-toolbar__content',
      style: {
        height: convertToUnit(computedContentHeight.value),
      },
    }, getSlot(context))
  }
  function genExtension() {
    return h('div', {
      staticClass: 'v-toolbar__extension',
      style: {
        height: convertToUnit(props.extensionHeight),
      },
    }, getSlot(context, 'extension'))
  }

  return {
    computedHeight,
    computedContentHeight,
    classes,
    isCollapsed,
    isProminent,
    styles,
    genBackground,
    genContent,
    genExtension,
    setBackgroundColor,
    ...toRefs(data),
  }
}

const VToolbar = defineComponent({
  name: 'v-toolbar',
  props: VToolbarProps,
  setup(props, context) {
    const {
      genContent,
      setBackgroundColor,
      genExtension,
      genBackground,
      styles,
      classes,
      isExtended,
    } = useVToolbar(props, context)
    isExtended.value = props.extended || !!context.slots.extension

    const children = [genContent()]
    const data = setBackgroundColor(props.color, {
      class: classes.value,
      style: styles.value,
      ...context.attrs,
    })

    if (isExtended.value) children.push(genExtension())
    if (props.src || context.slots.img) children.unshift(genBackground())

    return h(props.tag, data, children)
  },
})

export default VToolbar

