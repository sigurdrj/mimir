import { get as getContentByKey, type Content } from '/lib/xp/content'
import { type ResourceKey, render } from '/lib/thymeleaf'
import { render as r4XpRender, type RenderResponse } from '/lib/enonic/react4xp'
import type { ActiveStatistics as ActiveStatisticsPartConfig } from '.'
import type { Statistics } from '/site/content-types'
import { SEO } from '/services/news/news'
import { getContent, getComponent, pageUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'

const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

const view: ResourceKey = resolve('./activeStatistics.html')

export function get(req: XP.Request): RenderResponse | XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

export function preview(req: XP.Request): RenderResponse {
  return renderPart(req)
}

function renderPart(req: XP.Request): RenderResponse {
  const page: Content = getContent()
  const partConfig: ActiveStatisticsPartConfig = getComponent().config
  const activeStatistics: ActiveStatisticsPartConfig['relatedStatisticsOptions'] = partConfig.relatedStatisticsOptions
    ? forceArray(partConfig.relatedStatisticsOptions)
    : []

  const statisticsTitle: string = localize({
    key: 'menuStatistics',
    locale: page.language,
  })

  if (!activeStatistics || activeStatistics.length === 0) {
    if (req.mode === 'edit') {
      return {
        body: render(view, {
          statisticsTitle,
        }),
        pageContributions: '' as XP.PageContributions,
      }
    }
  }

  return renderActiveStatistics(req, statisticsTitle, parseContent(activeStatistics))
}

function renderActiveStatistics(
  req: XP.Request,
  statisticsTitle: string,
  activeStatisticsContent: Array<ActiveStatistic | undefined>
): RenderResponse {
  if (activeStatisticsContent && activeStatisticsContent.length) {
    const id = 'active-statistics'
    const body: string = render(view, {
      activeStatisticsId: id,
    })
    const activeStatisticsXP: RenderResponse = r4XpRender(
      'StatisticsCards',
      {
        headerTitle: statisticsTitle,
        statistics: activeStatisticsContent.map((statisticsContent) => {
          return {
            ...statisticsContent,
          }
        }),
      },
      req,
      {
        id,
        body: body,
      }
    )

    return {
      body: activeStatisticsXP.body,
      pageContributions: activeStatisticsXP.pageContributions,
    }
  }
  return {
    body: '',
    pageContributions: '' as XP.PageContributions,
  }
}

function parseContent(
  activeStatistics: ActiveStatisticsPartConfig['relatedStatisticsOptions']
): Array<ActiveStatistic | undefined> {
  if (activeStatistics && activeStatistics.length) {
    return activeStatistics
      .map((statistics) => {
        if (statistics._selected === 'xp' && statistics.xp.contentId) {
          const statisticsContentId: string = statistics.xp.contentId
          const activeStatisticsContent: Content<Statistics, SEO> | null = getContentByKey({
            key: statisticsContentId,
          })

          const preamble: string = activeStatisticsContent?.x['com-enonic-app-metafields']['meta-data']
            .seoDescription as string

          return {
            title: activeStatisticsContent ? activeStatisticsContent.displayName : '',
            preamble: preamble ? preamble : '',
            href: pageUrl({
              id: statisticsContentId,
            }),
          }
        } else if (statistics._selected === 'cms') {
          return {
            title: statistics.cms.title,
            preamble: statistics.cms.profiledText,
            href: statistics.cms.url,
          }
        } else return undefined
      })
      .filter((statistics) => !!statistics)
  } else return []
}

interface ActiveStatistic {
  title: string
  preamble: string
  href: string
}
