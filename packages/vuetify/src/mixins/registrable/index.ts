import { InjectionKey } from '@util/injection';
import { consoleWarn } from '../../util/console';

function generateWarning(child: string, parent: string) {
  return () => consoleWarn(`The ${child} component must be used inside a ${parent}`)
}

export type Registrable = {
  register(...props: any[]): void
  unregister(self: any): void
}

export const registrable = (child?: string, parent?: string) => child && parent ? {
  register: generateWarning(child, parent),
  unregister: generateWarning(child, parent),
} as Registrable : undefined;

export type RegistrableKey = InjectionKey<Registrable>;

// export function provide(namespace: string, self = false) {
//   return Vue.extend({
//     name: 'registrable-provide',

//     provide(): object {
//       return {
//         [namespace]: self ? this : {
//           register: (this as any).register,
//           unregister: (this as any).unregister,
//         },
//       }
//     },
//   })
// }
