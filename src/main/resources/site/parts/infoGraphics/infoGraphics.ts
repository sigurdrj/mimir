// @ts-ignore
import { Base64 } from 'js-base64'
import { get as getContentByKey, type Content } from '/lib/xp/content'
import type { SourceList, SourcesConfig } from '/lib/ssb/utils/utils'
import { render } from '/lib/enonic/react4xp'
import { getContent, getComponent } from '/lib/xp/portal'
import { imageUrl } from '/lib/ssb/utils/imageUtils'
import type { InfoGraphics as InfoGraphicsPartConfig } from '.'

const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { getSources } = __non_webpack_require__('/lib/ssb/utils/utils')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const page = getContent()
  if (!page) throw Error('No page found')

  const phrases: { source: string; descriptionStaticVisualization: string } = getPhrases(page)
  const sourcesLabel: string = phrases.source
  const descriptionStaticVisualization: string = phrases.descriptionStaticVisualization

  const config = getComponent()?.config as InfoGraphicsPartConfig
  if (!config) throw Error('No part found')

  const sourceConfig: InfoGraphicsPartConfig['sources'] = config.sources ? forceArray(config.sources) : []

  // Encodes string to base64 and turns it into a dataURI
  const desc: string = Base64.encodeURI(config.longDesc ? config.longDesc : '')
  const longDesc: string = 'data:text/html;charset=utf-8;base64,' + desc

  const imageSrc: string | null = imageUrl({
    id: config.image,
    scale: 'max(850)',
    format: 'jpg',
  })

  // Retrieves image as content to get image meta data
  const imageData: Content<MediaImage> | null = getContentByKey({
    key: config.image,
  })

  const props: InfoGraphicsProps = {
    title: config.title,
    altText:
      imageData && imageData.data.altText
        ? imageData.data.altText
        : imageData && imageData.data.caption
        ? imageData.data.caption
        : '',
    imageSrc: imageSrc,
    footnotes: config.footNote ? forceArray(config.footNote) : [],
    sources: getSources(sourceConfig as Array<SourcesConfig>),
    longDesc,
    sourcesLabel,
    descriptionStaticVisualization,
    oldContent: true,
  }

  return render('site/parts/infoGraphics/infoGraphics', props, req)
}

interface InfoGraphicsProps {
  title: string
  altText: string
  imageSrc: string
  footnotes: InfoGraphicsPartConfig['footNote']
  sources: SourceList
  longDesc: string
  sourcesLabel: string
  descriptionStaticVisualization: string
  inFactPage?: boolean
  oldContent?: boolean
}
