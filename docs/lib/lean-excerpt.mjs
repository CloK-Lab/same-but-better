/** Named excerpts for Lean declarations at column zero with indented bodies.
 * This is a source reader, not an elaborator; `lake build` checks the Lean code.
 */
export function leanExcerpt(source, name) {
  // Preserve offsets while hiding nested comments and string contents from the
  // declaration search. Keep strings nonblank so body lines are not dropped.
  let clean = '', i = 0;
  while (i < source.length) {
    const start = i;
    if (source.startsWith('/-', i)) {
      let depth = 1; i += 2;
      while (i < source.length && depth) {
        if (source.startsWith('/-', i)) { depth++; i += 2; }
        else if (source.startsWith('-/', i)) { depth--; i += 2; }
        else i++;
      }
      clean += source.slice(start, i).replace(/[^\n]/g, ' ');
    } else if (source.startsWith('--', i)) {
      const end = source.indexOf('\n', i);
      i = end < 0 ? source.length : end;
      clean += ' '.repeat(i - start);
    } else if (source[i] === '"') {
      i++;
      while (i < source.length && source[i] !== '"') i += source[i] === '\\' ? 2 : 1;
      i = Math.min(i + 1, source.length);
      clean += source.slice(start, i).replace(/[^\n]/g, 'x');
    } else clean += source[i++];
  }
  const lines = clean.split('\n'), raw = source.split('\n');
  const head = /^(?:@\[[^\]]*\]\s*)*(?:(?:private|protected|noncomputable|partial|unsafe|nonrec)\s+)*(?:def|abbrev|theorem|lemma|inductive|structure|class|opaque|axiom)\s+([^\s:({\[⦃]+)/;
  const matches = lines.flatMap((line, index) => head.exec(line)?.[1] === name ? [index] : []);
  if (matches.length !== 1) throw new Error(`Expected one Lean declaration named ${name}; found ${matches.length}`);
  const start = matches[0];
  let last = start + 1;
  for (let index = start + 1; index < lines.length; index++) {
    if (!lines[index].trim()) continue;
    if (/^\s/.test(lines[index]) || /^(where|termination_by|decreasing_by)\b/.test(lines[index])) last = index + 1;
    else break;
  }
  // Include standalone attribute lines immediately preceding the declaration.
  let first = start;
  while (first > 0 && /^@\[[^\]]*\]\s*$/.test(lines[first - 1])) first--;
  return { code: raw.slice(first, last).join('\n').trimEnd(), first: first + 1, last };
}
