import { computed, ref, SetupContext, watch } from 'vue'

export type ProxyableProps<T extends string = 'value'> = {
  [K in T]: { required: false }
}

export const proxyableProps: <T extends string = 'value'>(prop?: T) => ProxyableProps<T> = <T extends string = 'value'>(prop: T = 'value' as any) => ({
  [prop]: { required: false }
})

export function proxyable<T extends string = 'value'>(prop?: T, event = 'change') {
  const useProxyable = useProxyableFactory(prop, event)
  const _proxyableProps = proxyableProps(prop)
  return {
    useProxyable,
    proxyableProps: _proxyableProps,
  }
}

// TODO: check this
// model: {
//   prop,
//   event,
// },

export function useProxyableFactory<T extends string = 'value'>(prop: T = 'value' as any, event = 'change') {
  function useProxyable(props: { [K in T]?: unknown }, context: SetupContext) {
    const internalLazyValue = ref(props[prop] as unknown)
    const internalValue = computed({
      get(): unknown {
        return internalLazyValue.value
      },
      set(val: any) {
        if (val === internalLazyValue.value) return

        internalLazyValue.value = val

        context.emit(event, val)
      },
    })
    watch(() => props[prop], (val) => {
      internalLazyValue.value = val
    })
    return {
      internalLazyValue,
      internalValue,
    }
  }
  return useProxyable
}

const Proxyable = useProxyableFactory()

export default Proxyable
