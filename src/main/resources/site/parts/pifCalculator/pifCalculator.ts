import type { Content } from '/lib/xp/content'
import { allMonths, monthLabel, nextPeriod } from '/lib/ssb/utils/calculatorUtils'
import type { CalculatorPeriod } from '/lib/types/calculator'
import { DropdownItems as MonthDropdownItems } from '/lib/types/components'
import type { Dataset, Dimension } from '/lib/types/jsonstat-toolkit'
import type { Language, Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import type { CalculatorConfig } from '/site/content-types'
import type { PifCalculator as PifCalculatorPartConfig } from '.'
import { getContent, getComponent, serviceUrl, pageUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { getLanguage } = __non_webpack_require__('/lib/ssb/utils/language')
const { getCalculatorConfig, getPifDataset } = __non_webpack_require__('/lib/ssb/dataset/calculator')
const { fromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')

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
  const page = getContent()
  if (!page) throw Error('No page found')

  let pifCalculator: XP.Response
  if (req.mode === 'edit' || req.mode === 'inline') {
    pifCalculator = getPifCalculatorComponent(req, page)
  } else {
    pifCalculator = fromPartCache(req, `${page._id}-pifCalculator`, () => {
      return getPifCalculatorComponent(req, page)
    })
  }

  return pifCalculator
}

function getPifCalculatorComponent(req: XP.Request, page: Content) {
  const partConfig = getComponent()?.config as PifCalculatorPartConfig
  if (!partConfig) throw Error('No part config found')

  const language: Language = getLanguage(page)
  const phrases: Phrases = language.phrases as Phrases
  const months: MonthDropdownItems = allMonths(phrases)
  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const pifData: Dataset | null = getPifDataset(config)
  const lastUpdated: CalculatorPeriod | undefined = lastPeriod(pifData) as CalculatorPeriod
  const nextUpdate: CalculatorPeriod = nextPeriod(lastUpdated.month as string, lastUpdated.year as string)
  const nextReleaseMonth: number = (nextUpdate.month as number) === 12 ? 1 : (nextUpdate.month as number) + 1
  const nextPublishText: string = localize({
    key: 'calculatorNextPublishText',
    locale: language.code,
    values: [
      monthLabel(months, language.code, lastUpdated.month),
      lastUpdated.year as string,
      monthLabel(months, language.code, nextUpdate.month),
      monthLabel(months, language.code, nextReleaseMonth),
    ],
  })
  const lastNumberText: string = localize({
    key: 'calculatorLastNumber',
    locale: language.code,
    values: [monthLabel(months, language.code, lastUpdated.month), lastUpdated.year as string],
  })
  const calculatorArticleUrl: string | undefined = partConfig.pifCalculatorArticle
    ? pageUrl({
        id: partConfig.pifCalculatorArticle,
      })
    : undefined

  return render(
    'PifCalculator',
    {
      pifServiceUrl: serviceUrl({
        service: 'pif',
      }),
      language: language.code,
      months,
      phrases,
      nextPublishText,
      lastNumberText,
      lastUpdated,
      productGroups: productGroups(phrases),
      calculatorArticleUrl,
    },
    req,
    {
      id: 'pifCalculatorId',
      body: '<section class="xp-part part-pif-calculator container"></section>',
    }
  )
}

function lastPeriod(pifData: Dataset | null): CalculatorPeriod | undefined {
  // eslint-disable-next-line new-cap
  const pifDataDimension: Dimension | null = pifData?.Dimension('Tid') as Dimension
  const dataTime: string | undefined = pifDataDimension?.id as string

  if (dataTime) {
    const lastTimeItem: string = dataTime[dataTime.length - 1]
    const splitTime: Array<string> = lastTimeItem.split('M')

    const lastYear: string = splitTime[0]
    const lastMonth: string = splitTime[1]

    return {
      month: lastMonth,
      year: lastYear,
    }
  }
  return
}

function productGroups(phrases: Phrases): MonthDropdownItems {
  return [
    {
      id: 'SITCT',
      title: phrases.pifProductTypeAll,
    },
    {
      id: 'SITC0',
      title: phrases.pifProductFood,
    },
    {
      id: 'SITC1',
      title: phrases.pifProductBeverage,
    },
    {
      id: 'SITC2',
      title: phrases.pifProductRaw,
    },
    {
      id: 'SITC3',
      title: phrases.pifProductFuel,
    },
    {
      id: 'SITC4',
      title: phrases.pifProductOil,
    },
    {
      id: 'SITC5',
      title: phrases.pifProductChemical,
    },
    {
      id: 'SITC6',
      title: phrases.pifProductManufactured,
    },
    {
      id: 'SITC7',
      title: phrases.pifProductMachine,
    },
    {
      id: 'SITC8',
      title: phrases.pifProductOther,
    },
  ]
}
