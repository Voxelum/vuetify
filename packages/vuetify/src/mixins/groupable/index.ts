import { computed, ExtractPropTypes, inject, onBeforeUnmount, reactive, SetupContext, toRefs } from 'vue'
// Mixins
import { registrable, RegistrableKey } from '../registrable'

export const groupableProps = <T extends RegistrableKey>(
  namespace: T,
) => ({
  activeClass: {
    type: String,
    default(): string | undefined {
      const value = inject(namespace, null as any)
      if (!value) return undefined
      return value.activeClass // TODO: check this
    },
  } /* as any as PropValidator<string> */,
  disabled: Boolean,
})

export const GroupableKey: RegistrableKey = 'itemGroups'

export function groupableFactory<T extends RegistrableKey>(key: T, child?: string, parent?: string) {
  const _groupableProps = groupableProps(key)
  const useGroupable = useGroupableFactory(key, child, parent)
  return {
    groupableProps: _groupableProps,
    useGroupable,
  }
}

export interface GroupableInstance {
  isActive: boolean;
  groupClasses: { [x: string]: string };
  toggle: () => void;
}

export function useGroupableFactory<T extends RegistrableKey>(key: T, child?: string, parent?: string) {
  function useGroupable(props: ExtractPropTypes<ReturnType<typeof groupableProps>>, context: SetupContext) {
    const injected = inject(key, registrable(child, parent))
    const data = reactive({ isActive: false })
    const groupClasses = computed(() => {
      if (!props.activeClass) return {}
      return {
        [props.activeClass]: data.isActive,
      }
    })

    function toggle() {
      context.emit('change')
    }

    const result = {
      ...toRefs(data),
      groupClasses,
      toggle,
    }

    type Result = (typeof result) & ({ [K in T]: typeof injected })

    const reactiveResult = reactive(result)
    injected && (injected).register(reactiveResult)

    onBeforeUnmount(() => {
      injected && (injected).unregister(reactiveResult)
    })

    return {
      ...result,
      [key]: injected,
    } as Result
  }
  return useGroupable
}

export default useGroupableFactory(GroupableKey)
