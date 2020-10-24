import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import './VDataFooter.sass'

// Components
import VSelect from '../VSelect/VSelect'
import VIcon from '../VIcon'
import VBtn from '../VBtn'

// Types
import Vue, { VNode, VNodeChildrenArrayContents, PropType } from 'vue'
import { DataPagination, DataOptions, DataItemsPerPageOption } from 'vuetify/types'
import { PropValidator } from 'vue/types/options'
export const VDataFooterProps = {
    options: {
      type: Object as PropType<DataOptions>,
      required: true,
    },
    pagination: {
      type: Object as PropType<DataPagination>,
      required: true,
    },
    itemsPerPageOptions: {
      type: Array,
      default: () => ([5, 10, 15, -1]),
    } as PropValidator<DataItemsPerPageOption[]>,
    prevIcon: {
      type: String,
      default: '$prev',
    },
    nextIcon: {
      type: String,
      default: '$next',
    },
    firstIcon: {
      type: String,
      default: '$first',
    },
    lastIcon: {
      type: String,
      default: '$last',
    },
    itemsPerPageText: {
      type: String,
      default: '$vuetify.dataFooter.itemsPerPageText',
    },
    itemsPerPageAllText: {
      type: String,
      default: '$vuetify.dataFooter.itemsPerPageAll',
    },
    showFirstLastPage: Boolean,
    showCurrentPage: Boolean,
    disablePagination: Boolean,
    disableItemsPerPage: Boolean,
    pageText: {
      type: String,
      default: '$vuetify.dataFooter.pageText',
    },
}

export default export function useVDataFooter(props: ExtractPropTypes<typeof VDataFooterProps>, context: SetupContext) {


    const disableNextPageIcon: Ref<boolean> = computed(() => {
      return props.options.itemsPerPage <= 0 ||
        props.options.page * props.options.itemsPerPage >= props.pagination.itemsLength ||
        props.pagination.pageStop < 0
    })
    const computedDataItemsPerPageOptions: Ref<any[]> = computed(() => {
      return props.itemsPerPageOptions.map(option => {
        if (typeof option === 'object') return option
        else return genDataItemsPerPageOption(option)
      })
    })

  function updateOptions (obj: object) {
      context.emit('update:options', Object.assign({}, props.options, obj))
    }
  function onFirstPage () {
      updateOptions({ page: 1 })
    }
  function onPreviousPage () {
      updateOptions({ page: props.options.page - 1 })
    }
  function onNextPage () {
      updateOptions({ page: props.options.page + 1 })
    }
  function onLastPage () {
      updateOptions({ page: props.pagination.pageCount })
    }
  function onChangeItemsPerPage (itemsPerPage: number) {
      updateOptions({ itemsPerPage, page: 1 })
    }
  function genDataItemsPerPageOption (option: number) {
      return {
        text: option === -1 ? context.vuetify.lang.t(props.itemsPerPageAllText) : String(option),
        value: option,
      }
    }
  function genItemsPerPageSelect () {
      let value = props.options.itemsPerPage
      const computedIPPO = computedDataItemsPerPageOptions.value

      if (computedIPPO.length <= 1) return null

      if (!computedIPPO.find(ippo => ippo.value === value)) value = computedIPPO[0]

      return context.createElement('div', {
        staticClass: 'v-data-footer__select',
      }, [
        context.vuetify.lang.t(props.itemsPerPageText),
        context.createElement(VSelect, {
          attrs: {
            'aria-label': props.itemsPerPageText,
          },
          props: {
            disabled: props.disableItemsPerPage,
            items: computedIPPO,
            value,
            hideDetails: true,
            auto: true,
            minWidth: '75px',
          },
          on: {
            input: onChangeItemsPerPage,
          },
        }),
      ])
    }
  function genPaginationInfo () {
      let children: VNodeChildrenArrayContents = ['–']

      if (props.pagination.itemsLength && props.pagination.itemsPerPage) {
        const itemsLength = props.pagination.itemsLength
        const pageStart = props.pagination.pageStart + 1
        const pageStop = itemsLength < props.pagination.pageStop || props.pagination.pageStop < 0
          ? itemsLength
          : props.pagination.pageStop

        children = context.scopedSlots['page-text']
          ? [context.scopedSlots['page-text']!({ pageStart, pageStop, itemsLength })]
          : [context.vuetify.lang.t(props.pageText, pageStart, pageStop, itemsLength)]
      }

      return context.createElement('div', {
        class: 'v-data-footer__pagination',
      }, children)
    }
  function genIcon (click: Function, disabled: boolean, label: string, icon: string): VNode {
      return context.createElement(VBtn, {
        props: {
          disabled: disabled || props.disablePagination,
          icon: true,
          text: true,
          // dark: props.dark, // TODO: add mixin
          // light: props.light // TODO: add mixin
        },
        on: {
          click,
        },
        attrs: {
          'aria-label': label, // TODO: Localization
        },
      }, [context.createElement(VIcon, icon)])
    }
  function genIcons () {
      const before: VNodeChildrenArrayContents = []
      const after: VNodeChildrenArrayContents = []

      before.push(genIcon(
        onPreviousPage,
        props.options.page === 1,
        context.vuetify.lang.t('$vuetify.dataFooter.prevPage'),
        context.vuetify.rtl ? props.nextIcon : props.prevIcon
      ))

      after.push(genIcon(
        onNextPage,
        disableNextPageIcon.value,
        context.vuetify.lang.t('$vuetify.dataFooter.nextPage'),
        context.vuetify.rtl ? props.prevIcon : props.nextIcon
      ))

      if (props.showFirstLastPage) {
        before.unshift(genIcon(
          onFirstPage,
          props.options.page === 1,
          context.vuetify.lang.t('$vuetify.dataFooter.firstPage'),
          context.vuetify.rtl ? props.lastIcon : props.firstIcon
        ))

        after.push(genIcon(
          onLastPage,
          props.options.page >= props.pagination.pageCount || props.options.itemsPerPage === -1,
          context.vuetify.lang.t('$vuetify.dataFooter.lastPage'),
          context.vuetify.rtl ? props.firstIcon : props.lastIcon
        ))
      }

      return [
        context.createElement('div', {
          staticClass: 'v-data-footer__icons-before',
        }, before),
        props.showCurrentPage && context.createElement('span', [props.options.page.toString()]),
        context.createElement('div', {
          staticClass: 'v-data-footer__icons-after',
        }, after),
      ]
    }

  return {
    disableNextPageIcon,
    computedDataItemsPerPageOptions,
    updateOptions,
    onFirstPage,
    onPreviousPage,
    onNextPage,
    onLastPage,
    onChangeItemsPerPage,
    genDataItemsPerPageOption,
    genItemsPerPageSelect,
    genPaginationInfo,
    genIcon,
    genIcons,
  }
}
const VDataFooter = defineComponent({
  name: 'v-data-footer',
  props: VDataFooterProps,
  setup(props, context) {
    const {} = useVDataFooter(props, context)
  },
})

export default VDataFooter

