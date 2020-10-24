import { ExtractPropTypes, reactive, SetupContext, toRefs, watch } from 'vue'

/* eslint-disable-next-line no-use-before-define */
// export type Toggleable<T extends string = 'value'> = VueConstructor<Vue & { isActive: boolean } & Record<T, any>>

// export function factory<T extends string = 'value'>(prop?: T, event?: string): Toggleable<T>
// export function factory(prop = 'value', event = 'input') {
//   return Vue.extend({
//     name: 'toggleable',

//     model: { prop, event },

//     props: {
//       [prop]: { required: false },
//     },

//     data() {
//       return {
//         isActive: !!this[prop],
//       }
//     },

//     watch: {
//       [prop](val) {
//         this.isActive = !!val
//       },
//       isActive(val) {
//         !!val !== this[prop] && this.$emit(event, val)
//       },
//     },
//   })
// }

// /* eslint-disable-next-line no-redeclare */
// const Toggleable = factory()

type togglePropsType<T extends string = 'value'> = {
  [K in T]: { required: false }
}

export const toggableProps = <T extends string = 'value'>(prop: T) => ({
  [prop ?? 'value']: {
    required: false
  }
})

export function toggableFactory <T extends string = 'value'>(prop: T = 'value', event = 'input') {
  const useToggleable = useToggleableFactory(prop, event)
  const _props = toggableProps(prop)
  return {
    useToggleable,
    toggableProps: _props,
  }
}

// v-model changed

export function useToggleableFactory<T extends string = 'value'>(prop?: T, event = 'input') {
  const propKey = (prop ?? 'value') as any
  function useToggleable(props: ExtractPropTypes<togglePropsType<T>>, context: SetupContext) {
    const data = reactive({
      isActive: !!props[propKey]
    })
    watch(props, (val) => {
      data.isActive = !!val
    })
    watch(() => data.isActive, (val) => {
      !!val !== props[propKey] && context.emit(event, val)
    })
    return {
      ...toRefs(data)
    }
  }
  return useToggleable
}

export default useToggleableFactory()