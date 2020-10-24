import { VNodeData } from '@util/vnodeData'
import { mergeProps, SetupContext } from 'vue'
import { isCssColor } from '../../util/colorUtils'

export const colorableProps = {
  color: String,
}

export function backgroundColor(color?: string | false) {
  if (isCssColor(color)) {
    return {
      style: {
        'background-color': `${color}`,
        'border-color': `${color}`,
      }
    }
  } else if (color) {
    return {
      class: color
    }
  }

  return {}
}

export function textColor(color?: string | false) {
  if (isCssColor(color)) {
    return {
      style: {
        color: `${color}`,
        'caret-color': `${color}`,
      }
    }
  } else if (color) {
    const [colorName, colorModifier] = color.toString().trim().split(' ', 2) as (string | undefined)[]
    return {
      class: {
        [colorName + '--text']: true,
        ['text--' + colorModifier]: !!colorModifier,
      }
    }
  }
  return {}
}

export function setBackgroundColor(color?: string | false, props: Record<string, unknown> = {}): VNodeData {
  return mergeProps(props, backgroundColor(color))
}

export function setTextColor(color?: string | false, props: Record<string, unknown> = {}): VNodeData {
  return mergeProps(props, textColor(color))
}

export default function useColorable(context: SetupContext) {
  return {
    setBackgroundColor,
    setTextColor,
  }
}
