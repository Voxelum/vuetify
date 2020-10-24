import { ExtractPropTypes, reactive, SetupContext, watch } from 'vue'

export const returnableProps = {
  returnValue: null as any,
}

/* @vue/component */
export default function useReturnable(props: ExtractPropTypes<typeof returnableProps>, context: SetupContext) {
  const data = reactive({
    isActive: false,
    originalValue: null as any,
  })

  watch(() => data.isActive, (val) => {
    if (val) {
      data.originalValue = props.returnValue
    } else {
      context.emit('update:return-value', data.originalValue)
    }
  })

  function save(value: any) {
    data.originalValue = value
    setTimeout(() => {
      data.isActive = false
    })
  }
  return {
    save,
  }
}
