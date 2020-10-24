import { VNodeProps } from "vue";

export interface VNodeData extends VNodeProps {
    key?: string | number;
    class?: any;
    style?: string | object[] | object;
    onClick?: Function;
    [key: string]: unknown
}
