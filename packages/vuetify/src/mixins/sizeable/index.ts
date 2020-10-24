import { computed, ExtractPropTypes, Ref } from 'vue'

export const sizeableProps = {
    large: Boolean,
    small: Boolean,
    xLarge: Boolean,
    xSmall: Boolean,
}

export default function useSizeable(props: ExtractPropTypes<typeof sizeableProps>) {
    const medium: Ref<boolean> = computed(() => {
      return Boolean(
        !props.xSmall &&
        !props.small &&
        !props.large &&
        !props.xLarge
      )
    })
    const sizeableClasses: Ref<object> = computed(() => {
      return {
        'v-size--x-small': props.xSmall,
        'v-size--small': props.small,
        'v-size--default': medium.value,
        'v-size--large': props.large,
        'v-size--x-large': props.xLarge,
      }
    })
  return {
    medium,
    sizeableClasses,
  }
}
