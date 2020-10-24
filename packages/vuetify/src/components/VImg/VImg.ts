import { useVResponsive, VResponsiveProps } from '@components/VResponsive/VResponsive'
import { computed, defineComponent, ExtractPropTypes, h, onMounted, PropType, reactive, Ref, SetupContext, VNode, watch } from 'vue'
import useThemeable, { themeableProps } from '../../mixins/themeable'
import { consoleWarn } from '../../util/console'
import mergeData from '../../util/mergeData'
// Components
import VResponsive from '../VResponsive'
// Styles
import './VImg.sass'

export interface srcObject {
  src: string
  srcset?: string
  lazySrc: string
  aspect: number
}

export const VImgProps = {
  ...VResponsiveProps,
  ...themeableProps,
  alt: String,
  contain: Boolean,
  eager: Boolean,
  gradient: String,
  lazySrc: String,
  options: {
    type: Object,
    // For more information on types, navigate to:
    // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    default: () => ({
      root: undefined,
      rootMargin: undefined,
      threshold: undefined,
    }),
  } as any as PropType<IntersectionObserverInit> /* as PropValidator<IntersectionObserverInit> */,
  position: {
    type: String,
    default: 'center center',
  },
  sizes: String,
  src: {
    type: [String, Object],
    default: '',
  } as any as PropType<srcObject | string> /* as PropValidator<string | srcObject> */,
  srcset: String,
  transition: {
    type: [Boolean, String],
    default: 'fade-transition',
  },
}

// not intended for public use, this is passed in by vuetify-loader
export interface srcObject {
  src: string
  srcset?: string
  lazySrc: string
  aspect: number
}

const hasIntersect = typeof window !== 'undefined' && 'IntersectionObserver' in window

/* @vue/component */
// VResponsive,
//   Themeable,
export function useVImg(props: ExtractPropTypes<typeof VImgProps>, context: SetupContext) {
  const { __cachedSizer, genContent: _genContent } = useVResponsive(props, context)
  const { themeClasses } = useThemeable(props)
  const data = reactive({
    currentSrc: '', // Set from srcset
    image: null as HTMLImageElement | null,
    isLoading: true,
    calculatedAspectRatio: undefined as number | undefined,
    naturalWidth: undefined as number | undefined,
    hasError: false,
  })

  const computedAspectRatio: Ref<number> = computed(() => {
    return Number(normalisedSrc.value.aspect || data.calculatedAspectRatio)
  })
  const normalisedSrc: Ref<srcObject> = computed(() => {
    return props.src && typeof props.src === 'object'
      ? {
        src: props.src.src,
        srcset: props.srcset || props.src.srcset,
        lazySrc: props.lazySrc || props.src.lazySrc,
        aspect: Number(props.aspectRatio || props.src.aspect),
      } : {
        src: props.src ?? '',
        srcset: props.srcset ?? '',
        lazySrc: props.lazySrc ?? '',
        aspect: Number(props.aspectRatio || 0),
      }
  })
  const __cachedImage: Ref<VNode | []> = computed(() => {
    if (!(normalisedSrc.value.src || normalisedSrc.value.lazySrc || props.gradient)) return []

    const backgroundImage: string[] = []
    const src = data.isLoading ? normalisedSrc.value.lazySrc : data.currentSrc

    if (props.gradient) backgroundImage.push(`linear-gradient(${props.gradient})`)
    if (src) backgroundImage.push(`url("${src}")`)

    const image = h('div', {
      staticClass: 'v-image__image',
      class: {
        'v-image__image--preload': data.isLoading,
        'v-image__image--contain': props.contain,
        'v-image__image--cover': !props.contain,
      },
      style: {
        backgroundImage: backgroundImage.join(', '),
        backgroundPosition: props.position,
      },
      key: +data.isLoading,
    })

    /* istanbul ignore if */
    if (!props.transition) return image

    return h('transition', {
      attrs: {
        name: props.transition,
        mode: 'in-out',
      },
    }, [image])
  })

  watch(() => props.src, () => {
    // Force re-init when src changes
    if (!data.isLoading) init(undefined, undefined, true)
    else loadImage()
  })

  onMounted(() => {
    init()
  })

  function init(
    entries?: IntersectionObserverEntry[],
    observer?: IntersectionObserver,
    isIntersecting?: boolean
  ) {
    // If the current browser supports the intersection
    // observer api, the image is not observable, and
    // the eager prop isn't being used, do not load
    if (
      hasIntersect &&
      !isIntersecting &&
      !props.eager
    ) return

    if (normalisedSrc.value.lazySrc) {
      const lazyImg = new Image()
      lazyImg.src = normalisedSrc.value.lazySrc
      pollForSize(lazyImg, null)
    }
    /* istanbul ignore else */
    if (normalisedSrc.value.src) loadImage()
  }
  function onLoad() {
    getSrc()
    data.isLoading = false
    context.emit('load', props.src)
  }
  function onError() {
    data.hasError = true
    context.emit('error', props.src)
  }
  function getSrc() {
    /* istanbul ignore else */
    if (data.image) data.currentSrc = data.image.currentSrc || data.image.src
  }
  function loadImage() {
    const image = new Image()
    data.image = image

    image.onload = () => {
      /* istanbul ignore if */
      if (image.decode) {
        image.decode().catch((err: DOMException) => {
          consoleWarn(
            `Failed to decode image, trying to render anyway\n\n` +
            `src: ${normalisedSrc.value.src}` +
            (err.message ? `\nOriginal error: ${err.message}` : ''),
            context
          )
        }).then(onLoad)
      } else {
        onLoad()
      }
    }
    image.onerror = onError

    data.hasError = false
    image.src = normalisedSrc.value.src
    props.sizes && (image.sizes = props.sizes)
    normalisedSrc.value.srcset && (image.srcset = normalisedSrc.value.srcset)

    props.aspectRatio || pollForSize(image)
    getSrc()
  }
  function pollForSize(img: HTMLImageElement, timeout: number | null = 100) {
    const poll = () => {
      const { naturalHeight, naturalWidth } = img

      if (naturalHeight || naturalWidth) {
        data.naturalWidth = naturalWidth
        data.calculatedAspectRatio = naturalWidth / naturalHeight
      } else {
        timeout != null && !data.hasError && setTimeout(poll, timeout)
      }
    }

    poll()
  }
  function genContent() {
    const content: VNode = _genContent()
    if (data.naturalWidth) {
      // TODO: check this
      props._b(content.props!, 'div', {
        style: { width: `${data.naturalWidth}px` },
      })
    }

    return content
  }
  function __genPlaceholder(): VNode | void {
    if (context.slots.placeholder) {
      const placeholder = data.isLoading
        ? [h('div', {
          staticClass: 'v-image__placeholder',
        }, context.slots.placeholder)]
        : []

      if (!props.transition) return placeholder[0]

      return h('transition', {
        props: {
          appear: true,
          name: props.transition,
        },
      }, placeholder)
    }
  }

  return {
    computedAspectRatio,
    normalisedSrc,
    themeClasses,
    __cachedImage,
    __cachedSizer,
    init,
    onLoad,
    onError,
    getSrc,
    loadImage,
    pollForSize,
    genContent,
    __genPlaceholder,
  }
}

const VImg = defineComponent({
  name: 'v-img',
  props: VImgProps,
  setup(props, context) {
    const {
      init,
      themeClasses,
      __cachedSizer,
      __cachedImage,
      __genPlaceholder,
      genContent,
    } = useVImg(props, context)
    return () => {
      const node = VResponsive.render!()

      // TODO: check this render

      const data = mergeData(node.data!, {
        staticClass: 'v-image',
        attrs: {
          'aria-label': props.alt,
          role: props.alt ? 'img' : undefined,
        },
        class: themeClasses,
        // Only load intersect directive if it
        // will work in the current browser.
        directives: hasIntersect
          ? [{
            name: 'intersect',
            modifiers: { once: true },
            value: {
              handler: init,
              options: props.options,
            },
          }]
          : undefined,
      })

      node.children = [
        __cachedSizer.value,
        __cachedImage.value,
        __genPlaceholder(),
        genContent(),
      ] as VNode[]

      return h(node.tag, data, node.children)
    }
  },
})

export default VImg

