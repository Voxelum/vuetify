import { VAvatarProps } from '@components/VAvatar/VAvatar'
import { computed, defineComponent, ExtractPropTypes, h, Ref, SetupContext } from 'vue'
// Components
import VAvatar from '../VAvatar'

export const VListItemAvatarProps = {
  ...VAvatarProps,
  horizontal: Boolean,
  size: {
    type: [Number, String],
    default: 40,
  },
}

/* @vue/component */
export function useVListItemAvatar(props: ExtractPropTypes<typeof VListItemAvatarProps>, context: SetupContext) {
  const classes: Ref<object> = computed(() => {
    return {
      'v-list-item__avatar--horizontal': props.horizontal,
      'v-avatar--tile': props.tile || props.horizontal,
    }
  })

  return {
    classes,
  }
}
const VListItemAvatar = defineComponent({
  name: 'v-list-item-avatar',
  props: VListItemAvatarProps,
  setup(props, context) {
    const { classes } = useVListItemAvatar(props, context)
    return () => h(VAvatar, { class: classes.value }, context.slots)
  },
})

export default VListItemAvatar

