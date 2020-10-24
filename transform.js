/* eslint-disable max-statements */
const fs = require('fs');
const { join, basename } = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const skip = [
  'VAlert',
  'VApp',
  'VAvatar',
  'VBadge',
  'VBtn',
  'VCard',
  'VChip',
  'VChipGroup',
  'VCounter',
  'VHover',
  'VItemGroup',
  'VLabel',
  'VSheet',
  'VSlideGroup',
  'VIcon',
  'VResponsive',
  'VImg',
  'VLazy',
  'VMain',
  'VInput',
  'VSubheader',
  'VOverlay',
  'VProgressCircular',
]

async function main() {
  const parent = './packages/vuetify/src/components'
  const comps = fs.readdirSync(parent)
  for (const comp of comps) {
    if (skip.indexOf(comp) !== -1) continue
    if (comp.endsWith('.ts')) continue
    const compdir = join(parent, comp)
    for (const compFile of fs.readdirSync(compdir)) {
      const file = join(compdir, compFile)
      if (compFile.endsWith('.mod.ts.mod.ts')) {
        fs.unlinkSync(file)
        continue
      }
      if (compFile.endsWith('.mod.ts')) continue

      if (compFile.endsWith('.ts') && compFile !== 'index.ts') {
        await transformFile(file, basename(compFile, '.ts'))
      }
    }
  }
}

function capital(name) {
  let remain = name.substring(1)
  const i = remain.indexOf('-')
  if (i !== -1) {
    remain = remain.substring(0, i) + capital(remain.substring(i + 1))
  }
  return `${name[0].toUpperCase()}${name.substring(1)}`
}

function transformCreate(lines) {
  return lines
}

function pretransformRender(lines) {
  return lines
}

function getIndent(line) {
  for (let i = 0; i < line.length; ++i) {
    if (line[i] !== ' ') return i
  }
  return 0
}

function pretransformProps(lines, namespace) {
  for (const line of lines) {
    const indent = getIndent(line)
    if (indent === 4) {
      const index = line.trim().indexOf(':')
      if (index !== -1) {
        const name = line.trim().substring(0, index).trim()
        namespace[name] = `props.${name}`
      }
    }
  }
}
function pretransformMethod(lines, namespace) {
  for (const line of lines) {
    const indent = getIndent(line)
    if (indent === 4) {
      if (line.startsWith('    }')) {
        if (line.endsWith(',')) {
        } else {
        }
      } else if (!line.trim().startsWith('/*')) {
        const name = line.trim().substring(0, line.trim().indexOf('(')).trim()
        namespace[name] = name
        namespace.exports.push(name)
      } else {
      }
    } else {
    }
  }
}

/**
 * 
 * @param {string[]} lines 
 */
function transformComputed(lines) {
  let inside = false
  const result = []
  for (const line of lines) {
    const indent = getIndent(line)
    if (indent === 4) {
      if (line.trim().length === 0) continue
      if (line.trim().startsWith('//')) continue
      if (line.trim().startsWith('/*')) continue
      if (line.trim().startsWith('*/')) continue
      if (!inside) {
        // start
        const iOfBrack = line.indexOf('(')
        if (iOfBrack !== -1) {
          const name = line.substring(0, iOfBrack - 1).trim()
          const iOfSign = line.substring(line.indexOf(':'))
          if (iOfSign !== -1) {
            const type = line.substring(line.indexOf(':') + 1, line.lastIndexOf('{') - 1).trim()
            if (type.length > 0) {
              result.push(`    const ${name}: Ref<${type}> = computed(() => {`)
            } else {
              result.push(`    const ${name} = computed(() => {`)
            }
          } else {
            result.push(`    const ${name} = computed(() => {`)
          }
          inside = true
        } else {
          const i = line.indexOf(':')
          if (i !== -1) {
            const name = line.substring(0, i).trim()
            result.push(`    const ${name} = computed({`)
            inside = true
          }
        }
      } else {
        if (line.startsWith('    }')) {
          result.push(`    })`)
          inside = false
        } else {
          result.push(line)
        }
      }
    } else if (line.startsWith('    }')) {
      result.push(`    })`)
      inside = false
    } else {
      result.push(line)
    }
  }
  return result
}
/**
 * @param {string[]} lines
 */
function pretransformComputed(lines, namespace) {
  let inside = false
  for (const line of lines) {
    const indent = getIndent(line)
    if (indent === 4) {
      if (line.trim().length === 0) continue
      if (line.trim().startsWith('//')) continue
      if (line.trim().startsWith('/*')) continue
      if (line.trim().startsWith('*/')) continue
      if (!inside) {
        // start
        const iOfBrack = line.indexOf('(')
        if (iOfBrack !== -1) {
          const name = line.substring(0, iOfBrack - 1).trim()
          namespace[name] = `${name}.value`
          namespace.exports.push(name)
          inside = true
        } else {
          const i = line.indexOf(':')
          if (i !== -1) {
            const name = line.substring(0, i).trim()
            namespace[name] = `${name}.value`
            namespace.exports.push(name)
            inside = true
          }
        }
      } else if (line.startsWith('    }')) {
        inside = false
      }
    }
  }
}

function pretransformData(lines, namespace) {
  for (const line of lines) {
    if (line.trim().length === 0) continue
    if (line.trim().startsWith('return {')) continue
    const name = line.substring(0, line.indexOf(':')).trim()
    if (name) {
      namespace[name] = `data.${name}`
    }
  }
}
/**
 * @param {string[]} lines
 */
function transformData(lines, namespace) {
  const result = [`  const data = reactive({`]
  let extraBracket = false
  for (const line of lines) {
    if (line.trim().length === 0) continue
    if (line.trim().startsWith('return {')) {
      extraBracket = true
      continue
    }
    const name = line.substring(line.indexOf(':'))
    if (name) {
      namespace[name] = `data.${name}`
    }
    result.push(line)
  }
  return extraBracket ? result.concat(')') : result.concat('  })')
}

function generateProps(lines, name) {
  return [
    `export const ${name}Props = {`,
    ...lines,
    '}',
  ]
}

/**
 * @param {string[]} lines
 */
function transformMethods(lines) {
  const result = []
  for (const line of lines) {
    const indent = getIndent(line)
    if (indent === 4) {
      if (line.startsWith('    }')) {
        if (line.endsWith(',')) {
          result.push(line.substring(0, line.length - 1))
        } else {
          result.push(line)
        }
      } else if (!line.trim().startsWith('/*') && !line.trim().startsWith('//') && !line.trim().startsWith(')')) {
        result.push(`  function ${line.trim()}`)
      } else {
        result.push(line)
      }
    } else {
      result.push(line)
    }
  }
  return result
}

function transformWatch(lines, namespace) {
  const result = []
  let inside = false
  let l = 0
  for (; l < lines.length; ++l) {
    const line = lines[l]
    const tline = line.trim()
    if (!inside) {
      let i = tline.indexOf('(')
      if (i !== -1) {
        const params = tline.slice(i, tline.indexOf(')') + 1)
        const target = namespace[tline.slice(0, i).trim()]
        if (target) {
          if (target.endsWith('.value')) {
            result.push(`watch(${target.substring(0, target.length - '.value'.length)}, ${params} => {`)
          } else if (target.startsWith('data.')) {
            result.push(`watch(() => ${target}, ${params} => {`)
          } else if (target.startsWith('props')) {
            result.push(`watch(() => ${target}, ${params} => {`)
          }
        }
      } else {
        i = tline.indexOf(':')
        if (i !== -1) {
          const target = namespace[tline.slice(0, i).trim()]
          let params
          let body = []
          let start = l
          for (; l < lines.length; l++) {
            const tline = lines[l].trim()
            if (tline.startsWith('handler')) {
              start = l
              params = tline.slice(tline.indexOf('('), tline.indexOf(')') + 1)
            } else if (tline === '},') {
              body = lines.slice(start + 1, i)
              break
            }
          }
          if (target) {
            if (target.endsWith('.value')) {
              result.push(`watch(${target.substring(0, target.length - '.value'.length)}, ${params} => {`)
            } else if (target.startsWith('data.')) {
              result.push(`watch(() => ${target}, ${params} => {`)
            } else if (target.startsWith('props')) {
              result.push(`watch(() => ${target}, ${params} => {`)
            }
          }
          result.push(...body, '{')
        }
      }
      inside = true
    } else if (tline === '},') {
      result.push('})')
      inside = false
    } else {
      result.push(line)
    }
  }
  return result
}

/**
 * @param {string[]} lines
 */
function transformHook(lines, newHook) {
  const result = [
    `  ${newHook}(() => {`,
    ...lines,
    `  })`,
  ]
  return result
}

function transformToSetup(lines) {
  return lines
}

function transformLine(line, namespace) {
  let result = ''
  let remain = line
  let index = 0
  let p = line.indexOf('$') !== -1
  do {
    index = remain.indexOf('this.')
    if (index === -1) {
      result += remain
      break
    }
    result += remain.substring(0, index)
    remain = remain.substring(index + 'this.'.length)

    let i = 0
    for (i = 0; i < remain.length; ++i) {
      if (!remain[i].match(/[a-zA-Z0-9_$]/)) {
        break
      }
    }
    const varName = remain.substring(0, i)
    if (namespace[varName]) {
      result += namespace[varName]
    } else if (varName.startsWith('$')) {
      result += `context.${varName.substring(1, varName.length)}`
    } else {
      result += `props.${varName}`
    }

    remain = remain.substring(i)
  } while (remain.length > 0)
  // if (result.trim().indexOf('$') !== -1) {
  //   console.log(line.trim())
  //   console.log(result.trim())
  //   console.log('-')
  // }
  return result
}

function generateRender(lines, name, nameLine) {
  const result = [
    `const ${name} = defineComponent({`,
    nameLine,
    `  props: ${name}Props,`,
    `  setup(props, context) {`,
    `    const {} = use${name}(props, context)`,
    ...lines,
    `  },`,
    `})`,
    ``,
    `export default ${name}`,
    ``,
  ]
  return result
}

async function transformFile(file, name) {
  const buf = await readFile(file)
  const lines = buf.toString().split('\n')
  const result = [
    'import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from \'vue\'',
  ]
  const namespace = { exports: [] }
  let inside = false
  let propsBlock = []
  let render = []
  let once = false
  let nameLine = ''
  let ending = false

  console.log(file)
  for (let i = 0; i < lines.length;) {
    const line = lines[i]
    const indent = getIndent(line)
    if (indent === 0) {
      if (line.endsWith('.extend({')) {
        inside = true
      } else if (line === '})') {
        //   // end line
        inside = false
        //   ++i
      }
      ++i
    } else if (!inside) {
      ++i
    } else if (indent > 2) {
      ++i
    } else if (indent === 2) {
      if (line.trim().startsWith('name:')) {
        nameLine = line
        ++i
        continue
      }
      const end = lines.slice(i + 1).findIndex(l => l.startsWith('  }') || l.startsWith('  })')) + i + 1
      const block = lines.slice(i + 1, end)
      switch (line.trim()) {
        case 'data: () => ({':
        case 'data () {':
          pretransformData(block, namespace)
          break
        case 'computed: {':
          pretransformComputed(block, namespace)
          break
        case 'props: {':
          propsBlock = [...block]
          pretransformProps(block, namespace)
          break
        case 'methods: {':
          pretransformMethod(block, namespace)
          break
      }
      if (line.trim().startsWith('name:')) {
        nameLine = line
      }
      i = end + 1
    } else {
      ++i
    }
  }

  // console.log(file)
  // console.log(namespace)

  let i = 0
  let propsInject = 0

  for (i = lines.length - 1; i >= 0; --i) {
    const line = lines[i]
    if (line.trim().startsWith('import')) {
      propsInject = i + 1
      break
    }
  }

  for (i = 0; i < lines.length;) {
    if (i === propsInject) {
      result.push(...generateProps(propsBlock, name))
    }
    if (ending) {
      i++
      continue
    }
    const line = lines[i]
    const indent = getIndent(line)
    if (indent === 0) {
      if (line.endsWith('.extend({') && !once) {
        inside = true
        const start = line.indexOf('Vue.extend')
        result.push(line.substring(0, start) + `export function use${capital(name)}(props: ExtractPropTypes<typeof ${name}Props>, context: SetupContext) {`)
        // result.push(`export default function use${capital(name)}() {`)
      } else if (line === '})' && inside && !once) {
        //   // end line
        once = true

        result.push('  return {',
          ...namespace.exports.map(r => '    ' + r + ','),
          '  }'
        )
        result.push('}')
        result.push(...generateRender(render, name, nameLine))
        //   ++i
        inside = false
      } else if (line.startsWith('export default')) {
        if (once) {
          ending = true
        }
      } else {
        result.push(line)
      }
      ++i
    } else if (!inside) {
      result.push(line)
      ++i
    } else if (indent > 2) {
      result.push(line)
      ++i
    } else if (indent === 2) {
      if (line.trim().startsWith('name:')) {
        nameLine = line
        ++i
        continue
      }
      const end = lines.slice(i + 1).findIndex(l => l.startsWith('  }') || l.startsWith('  })')) + i + 1
      const block = lines.slice(i + 1, end).map(line => transformLine(line, namespace))
      switch (line.trim()) {
        case 'data: () => ({':
        case 'data () {':
          result.push(...transformData(block, namespace))
          break
        case 'watch: {':
          result.push(...transformWatch(block, namespace))
          break
        case 'beforeUpdate () {':
          result.push(...transformHook(block, 'onBeforeUpdate'))
          break
        case 'updated () {':
          result.push(...transformHook(block, 'onUpdated'))
          break
        case 'mounted () {':
          result.push(...transformHook(block, 'onMounted'))
          break
        case 'beforeDestroy () {':
          result.push(...transformHook(block, 'onBeforeUnmount'))
          break
        case 'destroyed () {':
          result.push(...transformHook(block, 'onUnmounted'))
          break
        case 'methods: {':
          result.push(...transformMethods(block))
          break
        case 'computed: {':
          result.push(...transformComputed(block))
          break
        case 'created () {':
          result.push(...transformCreate(block))
          break
      }
      if (line.trim().startsWith('render (h')) {
        render = pretransformRender(block)
      }
      i = end + 1
    } else {
      result.push(line)
      ++i
    }
  }

  await writeFile(file + '.mod.ts', result.join('\n'))
}

main()
