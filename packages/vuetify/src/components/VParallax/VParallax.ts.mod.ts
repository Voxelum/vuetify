import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Style
import './VParallax.sass'

// Mixins
import Translatable from '../../mixins/translatable'

// Types
import { VNode, VNodeData } from 'vue/types/vnode'
import mixins from '../../util/mixins'
export const VParallaxProps = {
    alt: {
      type: String,
      default: '',
    },
    height: {
      type: [String, Number],
      default: 500,
    },
    src: String,
    srcset: String,
}

const baseMixins = mixins(
  Translatable
)
interface options extends InstanceType<typeof baseMixins> {
  $refs: {
    img: HTMLImageElement
  }
}

/* @vue/component */
export function useVParallax(props: ExtractPropTypes<typeof VParallaxProps>, context: SetupContext) {


  const data = reactive({
    isBooted: false,
  })

    const styles: Ref<object> = computed(() => {
      return {
        display: 'block',
        opacity: data.isBooted ? 1 : 0,
        transform: `translate(-50%, ${props.parallax}px)`,
      }
    })

  onMounted(() => {
    init()
  })

  function init () {
      const img = context.refs.img

      if (!img) return

      if (img.complete) {
        props.translate()
        props.listeners()
      } else {
        img.addEventListener('load', () => {
          props.translate()
          props.listeners()
        }, false)
      }

      data.isBooted = true
    }
  function objHeight () {
      return context.refs.img.naturalHeight
    }

  return {
    styles,
    init,
    objHeight,
  }
}
const VParallax = defineComponent({
  name: 'v-parallax',
  props: VParallaxProps,
  setup(props, context) {
    const {} = useVParallax(props, context)
    const imgData: VNodeData = {
      staticClass: 'v-parallax__image',
      style: styles.value,
      attrs: {
        src: props.src,
        srcset: props.srcset,
        alt: props.alt,
      },
      ref: 'img',
    }

    const container = h('div', {
      staticClass: 'v-parallax__image-container',
    }, [
      h('img', imgData),
    ])

    const content = h('div', {
      staticClass: 'v-parallax__content',
    }, context.slots.default)

    return h('div', {
      staticClass: 'v-parallax',
      style: {
        height: `${props.height}px`,
      },
      on: context.listeners,
    }, [container, content])
  },
})

export default VParallax

