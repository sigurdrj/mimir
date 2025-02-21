import { getComponent, processHtml } from '/lib/xp/portal'
import type { FactBox as FactBoxPartConfig } from '.'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import { get as getContentByKey, type Content } from '/lib/xp/content'
import type { FactBox } from '/site/content-types'
import { render } from '/lib/thymeleaf'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

const view = resolve('./factBox.html')

export function get(req: XP.Request): XP.Response {
  try {
    const part = getComponent<FactBoxPartConfig>()
    if (!part) throw Error('No part found')

    return renderPart(req, part.config.factBox)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, id: string) {
  try {
    return renderPart(req, id)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request, factBoxId: string): XP.Response {
  // throw an error if there is no selected factbox, or an empty section for edit mode
  if (!factBoxId) {
    if (req.mode === 'edit') {
      return {
        body: render(view),
      }
    } else {
      throw new Error('Factbox - Missing Id')
    }
  }
  const factBoxContent: Content<FactBox> | null = getContentByKey({
    key: factBoxId,
  })
  if (!factBoxContent) throw new Error(`FactBox with id ${factBoxId} doesn't exist`)
  const text: string = processHtml({
    value: factBoxContent.data.text.replace(/&nbsp;/g, ' '),
  })
  const body: string = render(view)
  return r4XpRender(
    'FactBox',
    {
      header: factBoxContent.displayName,
      text,
    },
    req,
    {
      body: body,
    }
  )
}
