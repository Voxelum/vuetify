import { useVuetify } from '@framework'
import { TargetProp } from 'types/services/application'
import { computed, ExtractPropTypes, getCurrentInstance, onActivated, onDeactivated, onMounted, onUnmounted, SetupContext, watch } from 'vue'
import { positionableProps } from '../positionable'


export const applicationableProps = {
  ...positionableProps(['absolute', 'fixed']),
  app: Boolean,
}

// TODO: rethink how this implement

export default function applicationable(value: TargetProp, events: string[] = []) {
  function useApplicationable(props: ExtractPropTypes<typeof applicationableProps>, context: SetupContext) {
    const { application } = useVuetify()
    const instance = getCurrentInstance();
    const applicationProperty = computed(() => value)
    watch(() => props.app, (_, prev: boolean) => {
      prev
        ? removeApplication(true)
        : callUpdate()
    })
    watch(applicationProperty, (newVal, oldVal) => {
      application.unregister(instance?.uid, oldVal)
    })
    function callUpdate() {
      if (!props.app) return

      application.register(
        this._uid,
        applicationProperty,
        updateApplication()
      )
    }
    function removeApplication(force = false) {
      if (!force && !props.app) return

      application.unregister(
        this._uid,
        applicationProperty
      )
    }
    function updateApplication() { return 0 }

    onActivated(() => {
      callUpdate()
    })
    onMounted(() => {
      callUpdate()
    })
    onDeactivated(() => {
      removeApplication()
    })
    onUnmounted(() => {
      removeApplication()
    })
    for (let i = 0, length = events.length; i < length; i++) {
      watch(events[i], callUpdate)
    }
    callUpdate()
    return {
      applicationProperty,
    }
  }

  return {
    useApplicationable,
  }
}
