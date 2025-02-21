import type { Content } from '/lib/xp/content'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import { render } from '/lib/thymeleaf'
import type { MunicipalityWithCounty } from '/lib/ssb/dataset/klass/municipalities'
import type { MenuDropdown as MenuDropdownPartConfig } from '.'
import type { MenuDropdown } from '/site/content-types'
import { randomUnsafeString, scriptAsset } from '/lib/ssb/utils/utils'
import { assetUrl, getContent, getComponent, pageUrl, getSiteConfig, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'

__non_webpack_require__('/lib/xp/portal')
const { municipalsWithCounties, getMunicipality, removeCountyFromMunicipalityName } = __non_webpack_require__(
  '/lib/ssb/dataset/klass/municipalities'
)
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

const view = resolve('./menuDropdown.html')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const parsedMunicipalities: Array<MunicipalityWithCounty> = municipalsWithCounties()
  const municipality: MunicipalityWithCounty | undefined = getMunicipality(req)
  const component = getComponent<MenuDropdownPartConfig>()
  if (!component) throw Error('No part found')

  const siteConfig = getSiteConfig<XP.SiteConfig>()
  if (!siteConfig) throw Error('No site config found')

  let mapFolder = '/mapdata'

  if (typeof siteConfig.kommunefakta !== 'undefined' && siteConfig.kommunefakta.mapfolder) {
    mapFolder = siteConfig.kommunefakta.mapfolder
  }

  const dataPathAssetUrl: string = assetUrl({
    path: mapFolder,
  })

  const dataServiceUrl: string = serviceUrl({
    service: 'municipality',
  })

  const page = getContent<Content<MenuDropdown>>()
  if (!page) throw Error('No page found')

  const baseUrl: string = component.config.basePage
    ? pageUrl({
        id: component.config.basePage,
      })
    : pageUrl({
        id: page._id,
      })

  const searchBarText: string = localize({
    key: 'menuDropdown.searchBarText',
  })

  const municipalityItems: Array<Municipality> = parsedMunicipalities.map((municipality) => ({
    id: municipality.path,
    title: municipality.displayName,
  }))

  const municipalityName: string | undefined = municipality
    ? removeCountyFromMunicipalityName(municipality.displayName)
    : undefined
  const reactUuid: string = randomUnsafeString()

  const model: ThymeleafModel = {
    modeMunicipality: component.config.modeMunicipality,
    displayName: page.displayName,
    baseUrl,
    dataPathAssetUrl,
    dataServiceUrl,
    municipality: municipality,
    municipalityName: municipalityName,
    municipalityList: municipalityItems,
    dropdownId: reactUuid,
  }

  const thymeleafRender: string = render(view, model)

  // Dropdown react object for sticky menu
  return r4XpRender(
    'site/parts/menuDropdown/DropdownMunicipality',
    {
      ariaLabel: searchBarText,
      placeholder: searchBarText,
      items: municipalityItems,
      baseUrl: baseUrl,
    },
    req,
    {
      id: reactUuid,
      body: thymeleafRender,
      pageContributions: {
        bodyEnd: [scriptAsset('js/map.js'), scriptAsset('js/menuDropdown.js')],
      },
    }
  )
}

interface Municipality {
  id: string
  title: string
}

interface ThymeleafModel {
  modeMunicipality: boolean
  displayName: string
  baseUrl: string
  dataPathAssetUrl: string
  dataServiceUrl: string
  municipality: MunicipalityWithCounty | undefined
  municipalityName: string | undefined
  municipalityList: Array<Municipality>
  dropdownId: string
}
