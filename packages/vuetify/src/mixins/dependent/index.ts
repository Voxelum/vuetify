// import Vue from 'vue'

// import mixins from '../../util/mixins'
// import { VOverlay } from '../../components/VOverlay'

// interface options extends Vue {
//   $el: HTMLElement
//   $refs: {
//     content: HTMLElement
//   }
//   overlay?: InstanceType<typeof VOverlay>
// }

// interface DependentInstance extends Vue {
//   isActive?: boolean
//   isDependent?: boolean
// }

// function searchChildren (children: Vue[]): DependentInstance[] {
//   const results = []
//   for (let index = 0; index < children.length; index++) {
//     const child = children[index] as DependentInstance
//     if (child.isActive && child.isDependent) {
//       results.push(child)
//     } else {
//       results.push(...searchChildren(child.$children))
//     }
//   }

//   return results
// }

// /* @vue/component */
// export default mixins<options>().extend({
//   name: 'dependent',

//   data () {
//     return {
//       closeDependents: true,
//       isActive: false,
//       isDependent: true,
//     }
//   },

//   watch: {
//     isActive (val) {
//       if (val) return

//       const openDependents = this.getOpenDependents()
//       for (let index = 0; index < openDependents.length; index++) {
//         openDependents[index].isActive = false
//       }
//     },
//   },

//   methods: {
//     getOpenDependents (): any[] {
//       if (this.closeDependents) return searchChildren(this.$children)

//       return []
//     },
//     getOpenDependentElements (): HTMLElement[] {
//       const result = []
//       const openDependents = this.getOpenDependents()

//       for (let index = 0; index < openDependents.length; index++) {
//         result.push(...openDependents[index].getClickableDependentElements())
//       }

//       return result
//     },
//     getClickableDependentElements (): HTMLElement[] {
//       const result = [this.$el]
//       if (this.$refs.content) result.push(this.$refs.content)
//       if (this.overlay) result.push(this.overlay.$el as HTMLElement)
//       result.push(...this.getOpenDependentElements())

//       return result
//     },
//   },
// })

import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, watch, SetupContext, ref, getCurrentInstance, toRefs } from 'vue'
import Vue from 'vue'

import mixins from '../../util/mixins'
export const dependentProps = {
}

interface options/*  extends Vue  */{
  $el: HTMLElement
  // overlay?: InstanceType<typeof VOverlay>
}

interface DependentInstance/*  extends Vue */ {
  isActive?: boolean
  isDependent?: boolean
}

function searchChildren(children: Vue[]): DependentInstance[] {
  const results = []
  for (let index = 0; index < children.length; index++) {
    const child = children[index] as DependentInstance
    if (child.isActive && child.isDependent) {
      results.push(child)
    } else {
      results.push(...searchChildren(child.$children))
    }
  }

  return results
}

/* @vue/component */
export function useDependent(props: ExtractPropTypes<typeof dependentProps>, context: SetupContext) {
  const data = reactive({
    closeDependents: true,
    isActive: false,
    isDependent: true,
  })

  const el: Ref<HTMLElement | null> = ref(null)
  const content: Ref<HTMLElement | null> = ref(null)

  watch(() => data.isActive, (val) => {
    if (val) return

    const openDependents = getOpenDependents()
    for (let index = 0; index < openDependents.length; index++) {
      openDependents[index].isActive = false
    }
  })

  function getOpenDependents(): any[] {
    if (data.closeDependents) return searchChildren(context.children)

    return []
  }
  function getOpenDependentElements(): HTMLElement[] {
    const result = []
    const openDependents = getOpenDependents()

    for (let index = 0; index < openDependents.length; index++) {
      result.push(...openDependents[index].getClickableDependentElements())
    }

    return result
  }
  function getClickableDependentElements(): HTMLElement[] {
    const result = [el.value]
    if (content.value) result.push(content.value)
    if (props.overlay) result.push(props.overlay.$el as HTMLElement)
    result.push(...getOpenDependentElements())

    return result
  }
  return {
    ...toRefs(data),
    el,
    content,
    getOpenDependents,
    getOpenDependentElements,
    getClickableDependentElements,
  }
}
