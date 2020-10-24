import { filterObjectOnKeys } from '../../util/helpers'
export const positionableProps = <T extends keyof typeof availableProps>(selected: T[] = ['absolute', 'bottom', 'fixed', 'left', 'top', 'right', 'bottom'] as any) =>
  filterObjectOnKeys(availableProps, selected)

const availableProps = {
  absolute: Boolean,
  bottom: Boolean,
  fixed: Boolean,
  left: Boolean,
  right: Boolean,
  top: Boolean,
}

// Add a `*` before the second `/`
/* Tests /
function usePositionable(props: ExtractPropTypes<typeof positionableProps>) {
    props.top
    props.bottom
    props.absolute
  return {
  }
}

function usePositionable(props: ExtractPropTypes<typeof positionableProps>) {
    props.top
    props.bottom
    props.absolute
  return {
  }
}

function usePositionable(props: ExtractPropTypes<typeof positionableProps>) {
    props.top
    props.bottom
    props.absolute
    props.foobar
  return {
  }
}
/**/
