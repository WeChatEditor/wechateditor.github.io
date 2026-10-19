import type MarkdownIt from 'markdown-it'

/** Classify block tokens before inline parsing so source text and colour offsets stay shared. */
export function registerArticleCards(md: InstanceType<typeof MarkdownIt>): void {
  md.core.ruler.after('block', 'article_cards', function classifyCards(state) {
    const tokens = state.tokens
    for (let index = 0; index < tokens.length; index++) {
      const opening = tokens[index]
      if (opening.type !== 'blockquote_open' || opening.level !== 0) {
        continue
      }
      let end = index + 1
      while (
        end < tokens.length &&
        !(tokens[end].type === 'blockquote_close' && tokens[end].level === opening.level)
      ) {
        end++
      }
      const paragraph = tokens[index + 1]
      const inline = tokens[index + 2]
      if (paragraph?.type !== 'paragraph_open' || inline?.type !== 'inline') {
        continue
      }
      const [firstLine, ...remaining] = inline.content.split('\n')
      const marker = /^\[!(hero|summary)\](?:[ \t]+(.*))?$/i.exec(firstLine)
      if (!marker) {
        continue
      }
      const kind = marker[1].toLowerCase()
      const body = tokens.slice(index + 4, end)
      const structure = body.find(function cardStructure(token) {
        return (
          token.level === opening.level + 1 &&
          (kind === 'hero'
            ? token.type === 'heading_open' && token.tag === 'h1'
            : ['bullet_list_open', 'ordered_list_open'].includes(token.type))
        )
      })
      if (!structure || end === tokens.length) {
        continue
      }
      opening.tag = 'section'
      opening.attrSet('data-card', kind)
      tokens[end].tag = 'section'
      if (kind === 'hero') {
        structure.attrSet('data-card-part', 'title')
      }
      const title = marker[2]?.trim() || ''
      const rest = remaining.join('\n')
      let delta = 0
      if (title) {
        paragraph.attrSet('data-card-part', kind === 'hero' ? 'eyebrow' : 'summary-title')
        inline.content = title
        if (rest) {
          const contentOpen = new state.Token('paragraph_open', 'p', 1)
          const content = new state.Token('inline', '', 0)
          const contentClose = new state.Token('paragraph_close', 'p', -1)
          contentOpen.level = contentClose.level = paragraph.level
          content.level = inline.level
          content.content = rest
          content.children = []
          contentOpen.block = content.block = contentClose.block = true
          if (paragraph.map) {
            contentOpen.map = content.map = [paragraph.map[0] + 1, paragraph.map[1]]
          }
          tokens.splice(index + 4, 0, contentOpen, content, contentClose)
          delta = 3
        }
      } else if (rest) {
        inline.content = rest
      } else {
        tokens.splice(index + 1, 3)
        delta = -3
      }
      if (paragraph.map && rest && !title) {
        paragraph.map[0]++
      } else if (paragraph.map && title) {
        paragraph.map[1] = paragraph.map[0] + 1
      }
      index = end + delta
    }
  })
}
