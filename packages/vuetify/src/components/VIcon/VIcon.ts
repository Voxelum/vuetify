import { VNodeData } from '@util/vnodeData'
import { computed, defineComponent, ExtractPropTypes, h, Ref, SetupContext, VNode, VNodeArrayChildren } from 'vue'
import useColorable, { colorableProps } from '../../mixins/colorable'
import { sizeableProps } from '../../mixins/sizeable'
import useThemeable, { themeableProps } from '../../mixins/themeable'
// Util
import { convertToUnit, keys, remapInternalIcon } from '../../util/helpers'
import './VIcon.sass'




//   BindsAttrs,
//   Colorable,
//   Sizeable,
//   Themeable

export const VIconProps = {
  ...colorableProps,
  ...sizeableProps,
  ...themeableProps,
  dense: Boolean,
  disabled: Boolean,
  left: Boolean,
  right: Boolean,
  size: [Number, String],
  tag: {
    type: String,
    required: false,
    default: 'i',
  },
}

enum SIZE_MAP {
  xSmall = '12px',
  small = '16px',
  default = '24px',
  medium = '28px',
  large = '36px',
  xLarge = '40px'
}

function isFontAwesome5(iconType: string): boolean {
  return ['fas', 'far', 'fal', 'fab', 'fad'].some(val => iconType.includes(val))
}

function isSvgPath(icon: string): boolean {
  return (/^[mzlhvcsqta]\s*[-+.0-9][^mlhvzcsqta]+/i.test(icon) && /[\dz]$/i.test(icon) && icon.length > 4)
}

/* @vue/component */
export function useVIcon(props: ExtractPropTypes<typeof VIconProps>, context: SetupContext) {
  const { themeClasses } = useThemeable(props)
  const { setTextColor } = useColorable(context)
  const medium = computed(() => {
    return false
  })
  const hasClickListener: Ref<boolean> = computed(() => {
    return Boolean(
      context.attrs.onClick/*  || props.listeners$['!click'] */
    )
  })

  function getIcon(): VuetifyIcon {
    let iconName = ''
    if (context.slots.default) iconName = context.slots.default?.()[0].el!.text!.trim()

    // TODO: check this
    return remapInternalIcon(context, iconName)
  }
  function getSize(): string | undefined {
    const sizes = {
      xSmall: props.xSmall,
      small: props.small,
      medium: medium.value,
      large: props.large,
      xLarge: props.xLarge,
    }

    const explicitSize = keys(sizes).find(key => sizes[key])

    return (
      (explicitSize && SIZE_MAP[explicitSize]) || convertToUnit(props.size)
    )
  }
  // Component data for both font and svg icon.
  function getDefaultData(): VNodeData {
    const data: VNodeData = {
      staticClass: 'v-icon notranslate',
      class: {
        'v-icon--disabled': props.disabled,
        'v-icon--left': props.left,
        'v-icon--link': hasClickListener.value,
        'v-icon--right': props.right,
        'v-icon--dense': props.dense,
      },
      'aria-hidden': !hasClickListener.value,
      disabled: hasClickListener.value && props.disabled,
      type: hasClickListener.value ? 'button' : undefined,
      ...context.attrs,
    }

    return data
  }
  function applyColors(data: VNodeData): void {
    data.class = { ...data.class, ...themeClasses.value }
    setTextColor(props.color, data)
  }
  function renderFontIcon(icon: string): VNode {
    const newChildren: VNodeArrayChildren = []
    const data = getDefaultData()

    let iconType = 'material-icons'
    // Material Icon delimiter is _
    // https://material.io/icons/
    const delimiterIndex = icon.indexOf('-')
    const isMaterialIcon = delimiterIndex <= -1

    if (isMaterialIcon) {
      // Material icon uses ligatures.
      newChildren.push(icon)
    } else {
      iconType = icon.slice(0, delimiterIndex)
      if (isFontAwesome5(iconType)) iconType = ''
    }

    data.class[iconType] = true
    data.class[icon] = !isMaterialIcon

    const fontSize = getSize()
    if (fontSize) data.style = { fontSize }

    applyColors(data)

    return h(hasClickListener.value ? 'button' : props.tag, data, newChildren)
  }
  function renderSvgIcon(icon: string): VNode {
    const fontSize = getSize()
    const wrapperData = {
      ...getDefaultData(),
      style: fontSize ? {
        fontSize,
        height: fontSize,
        width: fontSize,
      } : undefined,
    }
    wrapperData.class['v-icon--svg'] = true
    applyColors(wrapperData)

    const svgData: VNodeData = {
      attrs: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        height: fontSize || '24',
        width: fontSize || '24',
        role: 'img',
        'aria-hidden': true,
      },
    }

    return h(hasClickListener.value ? 'button' : 'span', wrapperData, [
      h('svg', svgData, [
        h('path', {
          d: icon,
        }),
      ]),
    ])
  }
  function renderSvgIconComponent(
    icon: VuetifyIconComponent,
  ): VNode {
    const data = getDefaultData()
    data.class['v-icon--is-component'] = true

    const size = getSize()
    if (size) {
      data.style = {
        fontSize: size,
        height: size,
        width: size,
      }
    }

    applyColors(data)

    const component = icon.component
    data.props = icon.props
    // TODO: check this
    // data.nativeOn = data.on

    return h(component, data)
  }

  return {
    medium,
    hasClickListener,
    getIcon,
    getSize,
    getDefaultData,
    applyColors,
    renderFontIcon,
    renderSvgIcon,
    renderSvgIconComponent,
  }
}

const VIcon = defineComponent({
  name: 'v-icon',
  props: VIconProps,
  setup(props, context) {
    const { getIcon, renderSvgIcon, renderFontIcon, renderSvgIconComponent } = useVIcon(props, context)
    return () => {
      const icon = getIcon()

      if (typeof icon === 'string') {
        if (isSvgPath(icon)) {
          return renderSvgIcon(icon)
        }
        return renderFontIcon(icon)
      }

      return renderSvgIconComponent(icon)
    }
  },
})

export default VIcon

