import { computed, ExtractPropTypes, onBeforeUnmount, reactive, Ref } from 'vue'
export const translatableProps = {
  height: Number,
}

export default function useTranslatable(rootRef: Ref<Element>, props: ExtractPropTypes<typeof translatableProps>) {
  const data = reactive({
    elOffsetTop: 0,
    parallax: 0,
    parallaxDist: 0,
    percentScrolled: 0,
    scrollTop: 0,
    windowHeight: 0,
    windowBottom: 0,
  })
  const imgHeight: Ref<number> = computed(() => {
    return objHeight()
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', translate, false)
    window.removeEventListener('resize', translate, false)
  })
  function calcDimensions() {
    const offset = rootRef.value.getBoundingClientRect()

    data.scrollTop = window.pageYOffset
    data.parallaxDist = imgHeight.value - props.height! // TODO: fix this type
    data.elOffsetTop = offset.top + data.scrollTop
    data.windowHeight = window.innerHeight
    data.windowBottom = data.scrollTop + data.windowHeight
  }
  function listeners() {
    window.addEventListener('scroll', translate, false)
    window.addEventListener('resize', translate, false)
  }
  /** @abstract **/
  function objHeight(): number {
    throw new Error('Not implemented !')
  }
  function translate() {
    calcDimensions()

    data.percentScrolled = (
      (data.windowBottom - data.elOffsetTop) /
      (parseInt(props.height!) + data.windowHeight) // TODO: fix this type
    )

    data.parallax = Math.round(data.parallaxDist * data.percentScrolled)
  }
  return {
    imgHeight,
    calcDimensions,
    listeners,
    objHeight,
    translate,
  }
}
