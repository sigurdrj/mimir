import type { Content } from '/lib/xp/content'
import type { MunicipalityWithCounty } from '/lib/ssb/dataset/klass/municipalities'
import type { KeyFigureView } from '/lib/ssb/parts/keyFigure'
import { render } from '/lib/enonic/react4xp'
import type { KeyFigure as KeyFigurePartConfig } from '.'
import { getContent, getComponent, getSiteConfig } from '/lib/xp/portal'

const { get: getKeyFigures, parseKeyFigure } = __non_webpack_require__('/lib/ssb/parts/keyFigure')
const { getMunicipality } = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { DATASET_BRANCH, UNPUBLISHED_DATASET_BRANCH } = __non_webpack_require__('/lib/ssb/repo/dataset')
const { hasWritePermissionsAndPreview } = __non_webpack_require__('/lib/ssb/parts/permissions')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')

export function get(req: XP.Request): XP.Response {
  try {
    const config = getComponent()?.config as KeyFigurePartConfig
    if (!config) throw Error('No part found')

    const keyFigureIds: Array<string> | [] = config.figure ? forceArray(config.figure) : []
    const municipality: MunicipalityWithCounty | undefined = getMunicipality(req)
    return renderPart(req, municipality, keyFigureIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, id: string): XP.Response {
  try {
    const siteConfig = getSiteConfig<XP.SiteConfig>()
    if (!siteConfig) throw Error('No site config found')

    const defaultMunicipality: XP.SiteConfig['defaultMunicipality'] = siteConfig.defaultMunicipality
    const municipality: MunicipalityWithCounty | undefined = getMunicipality({
      code: defaultMunicipality,
    } as unknown as XP.Request)
    return renderPart(req, municipality, [id])
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(
  req: XP.Request,
  municipality: MunicipalityWithCounty | undefined,
  keyFigureIds: Array<string>
): XP.Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  const config = getComponent()?.config as KeyFigurePartConfig
  const showPreviewDraft: boolean = hasWritePermissionsAndPreview(req, page._id)

  // get all keyFigures and filter out non-existing keyFigures
  const keyFigures: Array<KeyFigureData> = getKeyFigures(keyFigureIds).map((keyFigure) => {
    const keyFigureData: KeyFigureView = parseKeyFigure(keyFigure, municipality, DATASET_BRANCH)
    return {
      id: keyFigure._id,
      ...keyFigureData,
      source: keyFigure.data.source,
    }
  }) as Array<KeyFigureData>

  let keyFiguresDraft: Array<KeyFigureData> | null = null
  if (showPreviewDraft) {
    keyFiguresDraft = getKeyFigures(keyFigureIds).map((keyFigure) => {
      const keyFigureData: KeyFigureView = parseKeyFigure(keyFigure, municipality, UNPUBLISHED_DATASET_BRANCH)
      return {
        id: keyFigure._id,
        ...keyFigureData,
        source: keyFigure.data.source,
      }
    }) as Array<KeyFigureData>
  }

  return renderKeyFigure(page, config, keyFigures, keyFiguresDraft, showPreviewDraft, req)
}

function renderKeyFigure(
  page: Content,
  config: KeyFigurePartConfig,
  parsedKeyFigures: Array<KeyFigureData>,
  parsedKeyFiguresDraft: Array<KeyFigureData> | null,
  showPreviewDraft: boolean,
  req: XP.Request
): XP.Response {
  const draftExist = !!parsedKeyFiguresDraft
  if ((parsedKeyFigures && parsedKeyFigures.length > 0) || draftExist) {
    const hiddenTitle: Array<string> = parsedKeyFigures.map((keyFigureData) => {
      return keyFigureData.title
    })

    const props: KeyFigureProps = {
      displayName: config && config.title,
      keyFigures: parsedKeyFigures.map((keyFigureData) => {
        return {
          ...keyFigureData,
          glossary: keyFigureData.glossaryText,
        }
      }),
      keyFiguresDraft: parsedKeyFiguresDraft
        ? parsedKeyFiguresDraft.map((keyFigureDraftData) => {
            return {
              ...keyFigureDraftData,
              glossary: keyFigureDraftData.glossaryText,
            }
          })
        : undefined,
      sourceLabel: getPhrases(page).source,
      source: config && config.source,
      columns: config && config.columns,
      showPreviewDraft,
      paramShowDraft: req.params.showDraft,
      draftExist,
      pageTypeKeyFigure: page.type === `${app.name}:keyFigure`,
      hiddenTitle: hiddenTitle.toString().replace(/[\[\]']+/g, ''),
      isInStatisticsPage: page.type === `${app.name}:statistics`,
    }

    return render('KeyFigure', props, req, {
      body: '<section class="xp-part key-figures container"></section>',
    })
  }

  return {
    body: '',
    contentType: 'text/html',
  }
}

interface KeyFigureData {
  id: string
  iconUrl?: KeyFigureView['iconUrl']
  iconAltText?: KeyFigureView['iconAltText']
  number?: KeyFigureView['number']
  numberDescription?: KeyFigureView['numberDescription']
  noNumberText: KeyFigureView['noNumberText']
  size?: KeyFigureView['size']
  title: KeyFigureView['title']
  time?: KeyFigureView['time']
  changes?: KeyFigureView['changes']
  greenBox: KeyFigureView['greenBox']
  glossaryText?: KeyFigureView['glossaryText']
  glossary?: string
  source: object | undefined
}
interface KeyFigureProps {
  displayName: KeyFigurePartConfig['title']
  keyFigures: Array<KeyFigureData> | undefined
  keyFiguresDraft: Array<KeyFigureData> | undefined
  sourceLabel: string
  source: KeyFigurePartConfig['source']
  columns: KeyFigurePartConfig['columns']
  showPreviewDraft: boolean
  paramShowDraft: string | undefined
  draftExist: boolean
  pageTypeKeyFigure: boolean
  hiddenTitle: string
  isInStatisticsPage: boolean
}
