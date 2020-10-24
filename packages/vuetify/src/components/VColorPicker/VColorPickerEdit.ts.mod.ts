import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VColorPickerEdit.sass'

// Components
import VBtn from '../VBtn'
import VIcon from '../VIcon'

// Helpers
import { parseHex } from '../../util/colorUtils'

// Types
import Vue, { VNode, PropType } from 'vue'
import { VColorPickerColor, fromRGBA, fromHexa, fromHSLA } from './util'
export const VColorPickerEditProps = {
    color: Object as PropType<VColorPickerColor>,
    disabled: Boolean,
    hideAlpha: Boolean,
    hideModeSwitch: Boolean,
    mode: {
      type: String,
      default: 'rgba',
      validator: (v: string) => Object.keys(modes).includes(v),
    },
}

type Input = [string, number, string]

export type Mode = {
  inputs?: Input[]
  from: Function
}

export const modes = {
  rgba: {
    inputs: [
      ['r', 255, 'int'],
      ['g', 255, 'int'],
      ['b', 255, 'int'],
      ['a', 1, 'float'],
    ],
    from: fromRGBA,
  },
  hsla: {
    inputs: [
      ['h', 360, 'int'],
      ['s', 1, 'float'],
      ['l', 1, 'float'],
      ['a', 1, 'float'],
    ],
    from: fromHSLA,
  },
  hexa: {
    from: fromHexa,
  },
} as { [key: string]: Mode }

export default export function useVColorPickerEdit(props: ExtractPropTypes<typeof VColorPickerEditProps>, context: SetupContext) {


  const data = reactive({
      modes,
      internalMode: props.mode,
    }
)

    const currentMode: Ref<Mode> = computed(() => {
      return props.modes[data.internalMode]
    })

watch(() => props.mode, (mode) => {
      data.internalMode = mode
})

    data.internalMode = props.mode

  function getValue (v: any, type: string) {
      if (type === 'float') return Math.round(v * 100) / 100
      else if (type === 'int') return Math.round(v)
      else return 0
    }
  function parseValue (v: string, type: string) {
      if (type === 'float') return parseFloat(v)
      else if (type === 'int') return parseInt(v, 10) || 0
      else return 0
    }
  function changeMode () {
      const modes = Object.keys(props.modes)
      const index = modes.indexOf(data.internalMode)
      const newMode = modes[(index + 1) % modes.length]
      data.internalMode = newMode
      context.emit('update:mode', newMode)
    }
  function genInput (target: string, attrs: any, value: any, on: any): VNode {
      return context.createElement('div', {
        staticClass: 'v-color-picker__input',
      }, [
        context.createElement('input', {
          key: target,
          attrs,
          domProps: {
            value,
          },
          on,
        }),
        context.createElement('span', target.toUpperCase()),
      ])
    }
  function genInputs (): VNode[] | VNode {
      switch (data.internalMode) {
        case 'hexa': {
          const hex = props.color.hexa
          const value = props.hideAlpha && hex.endsWith('FF') ? hex.substr(0, 7) : hex
          return genInput(
            'hex',
            {
              maxlength: props.hideAlpha ? 7 : 9,
              disabled: props.disabled,
            },
            value,
            {
              change: (e: Event) => {
                const el = e.target as HTMLInputElement
                context.emit('update:color', currentMode.value.from(parseHex(el.value)))
              },
            }
          )
        }
        default: {
          const inputs = props.hideAlpha ? currentMode.value.inputs!.slice(0, -1) : currentMode.value.inputs!
          return inputs.map(([target, max, type]) => {
            const value = props.color[data.internalMode as keyof VColorPickerColor] as any
            return genInput(
              target,
              {
                type: 'number',
                min: 0,
                max,
                step: type === 'float' ? '0.01' : type === 'int' ? '1' : undefined,
                disabled: props.disabled,
              },
              getValue(value[target], type),
              {
                input: (e: Event) => {
                  const el = e.target as HTMLInputElement
                  const newVal = parseValue(el.value || '0', type)

                  context.emit('update:color', currentMode.value.from(
                    Object.assign({}, value, { [target]: newVal }),
                    props.color.alpha
                  ))
                },
              }
            )
          })
        }
      }
    }
  function genSwitch (): VNode {
      return context.createElement(VBtn, {
        props: {
          small: true,
          icon: true,
          disabled: props.disabled,
        },
        on: {
          click: changeMode,
        },
      }, [
        context.createElement(VIcon, '$unfold'),
      ])
    }

  return {
    currentMode,
    getValue,
    parseValue,
    changeMode,
    genInput,
    genInputs,
    genSwitch,
  }
}
const VColorPickerEdit = defineComponent({
  name: 'v-color-picker-edit',
  props: VColorPickerEditProps,
  setup(props, context) {
    const {} = useVColorPickerEdit(props, context)
    return h('div', {
      staticClass: 'v-color-picker__edit',
    }, [
      genInputs(),
      !props.hideModeSwitch && genSwitch(),
    ])
  },
})

export default VColorPickerEdit

