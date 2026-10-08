/** Paper-style blocks are document syntax, outside math and fenced code. */
export function expandMathEnvironments(source) {
  const stack = []
  let number = 0, fence = null, math = false
  const lines = source.split('\n').map((line, index) => {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1]
    if (fence) {
      if (marker?.[0] === fence[0] && marker.length >= fence.length && /^ {0,3}(`+|~+)\s*$/.test(line)) fence = null
      return line
    }
    if (marker) { fence = marker; return line }
    if (line.trim() === '$$') { math = !math; return line }
    if (math) return line
    const begin = /^\s*\\begin\{(definition|theorem|lemma|proof)\}(?:\[([^\]]*)\])?\s*$/.exec(line)
    const end = /^\s*\\end\{(definition|theorem|lemma|proof)\}\s*$/.exec(line)
    if (begin) {
      const [, kind, title = ''] = begin
      stack.push(kind)
      return `<MathStatement kind="${kind}"${kind === 'proof' ? '' : ` number={${++number}}`} title={${JSON.stringify(title)}}>\n`
    }
    if (end) {
      if (stack.pop() !== end[1]) throw new Error(`Mismatched mathematical environment at line ${index + 1}: ${end[1]}`)
      return '\n</MathStatement>'
    }
    return line
  })
  if (stack.length) throw new Error(`Unclosed mathematical environment: ${stack.at(-1)}`)
  return lines.join('\n')
}
