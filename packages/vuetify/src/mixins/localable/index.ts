import { useVuetify } from '@framework'
import { computed, ExtractPropTypes, Ref } from 'vue'
export const localableProps = {
  locale: String,
}

export default function useLocalable(props: ExtractPropTypes<typeof localableProps>) {
  const vuetify = useVuetify()
  const currentLocale: Ref<string> = computed(() => {
    return props.locale ?? vuetify.lang.current
  })
  return {
    currentLocale,
  }
}
