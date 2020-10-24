import { useVuetify } from '@framework'
import { computed, ExtractPropTypes, inject, PropType, provide, ref, Ref, watch } from 'vue'

export const themeableProps = {
  dark: {
    type: Boolean as PropType<boolean | null>,
    default: null,
  },
  light: {
    type: Boolean as PropType<boolean | null>,
    default: null,
  },
}

/* eslint-disable-next-line no-use-before-define */
interface Themeable {
  isDark: boolean
}

export function functionalThemeClasses(context: any): object {
  // const vm = {
  //   ...context.props,
  //   ...context.injections,
  // }
  // const isDark = Themeable.options.computed.isDark.call(vm)
  // return Themeable.options.computed.themeClasses.call({ isDark })
  // TODO: fix this
  return {}
}

/* @vue/component */
function useThemeable(props: ExtractPropTypes<typeof themeableProps>) {
  const parentTheme: Themeable | undefined = inject('theme')
  const themeableProvide = ref({ isDark: false })
  provide('theme', themeableProvide)
  const vuetify = useVuetify()

  const appIsDark: Ref<boolean> = computed(() => {
    return vuetify.theme.dark || false
  })
  const isDark: Ref<boolean> = computed(() => {
    if (props.dark === true) {
      // explicitly dark
      return true
    } else if (props.light === true) {
      // explicitly light
      return false
    } else {
      // inherit from parent, or default false if there is none
      return parentTheme?.isDark ?? false
    }
  })
  const themeClasses: Ref<object> = computed(() => {
    return {
      'theme--dark': isDark.value,
      'theme--light': !isDark.value,
    }
  })
  const rootIsDark: Ref<boolean> = computed(() => {
    if (props.dark === true) {
      // explicitly dark
      return true
    } else if (props.light === true) {
      // explicitly light
      return false
    } else {
      // inherit from v-app
      return appIsDark.value
    }
  })
  const rootThemeClasses: Ref<Dictionary<boolean>> = computed(() => {
    return {
      'theme--dark': rootIsDark.value,
      'theme--light': !rootIsDark.value,
    }
  })

  watch(isDark, (newVal, oldVal) => {
    if (newVal !== oldVal) {
      themeableProvide.value.isDark = isDark.value
    }
  }, {
    immediate: true,
  })

  return {
    appIsDark,
    isDark,
    themeClasses,
    rootIsDark,
    rootThemeClasses,
  }
}

export default useThemeable
