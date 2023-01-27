import { render, type RenderResponse } from '/lib/enonic/react4xp'
import type { EndedStatistics as EndedStatisticsPartConfig } from '.'
import { get as getContentByKey, type Content } from '/lib/xp/content'
import type { Phrases } from '/lib/types/language'
import type { Statistics } from '/site/content-types'
import { SEO } from '/services/news/news'
import { getComponent, getContent, pageUrl } from '/lib/xp/portal'

const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

export function get(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response | RenderResponse {
  const page: Content = getContent()
  const part: EndedStatisticsPartConfig = getComponent().config
  const endedStatistics: EndedStatisticsPartConfig['relatedStatisticsOptions'] = part.relatedStatisticsOptions
    ? forceArray(part.relatedStatisticsOptions)
    : []

  const phrases: Phrases = getPhrases(page) as Phrases

  return renderEndedStatistics(req, parseContent(endedStatistics), phrases)
}

function renderEndedStatistics(
  req: XP.Request,
  endedStatisticsContent: Array<EndedStatistic | undefined>,
  phrases: Phrases
): RenderResponse {
  if (endedStatisticsContent && endedStatisticsContent.length) {
    return render(
      'EndedStatistics',
      {
        endedStatistics: endedStatisticsContent.map((statisticsContent) => {
          return {
            ...statisticsContent,
          }
        }),
        iconText: phrases.endedCardText,
        buttonText: phrases.endedStatistics,
      },
      req,
      {
        body: '<section class="xp-part part-ended-statistics"></section>',
      }
    )
  } else {
    return {
      body: '',
      pageContributions: {},
    }
  }
}

function parseContent(
  endedStatistics: EndedStatisticsPartConfig['relatedStatisticsOptions']
): Array<EndedStatistic | undefined> {
  if (endedStatistics && endedStatistics.length) {
    return endedStatistics
      .map((statistics) => {
        if (statistics._selected === 'xp' && statistics.xp.contentId) {
          const statisticsContentId: string = statistics.xp.contentId
          const endedStatisticsContent: Content<Statistics, SEO> | null = statisticsContentId
            ? getContentByKey({
                key: statisticsContentId,
              })
            : null

          const preamble: string = endedStatisticsContent?.x['com-enonic-app-metafields']['meta-data']
            .seoDescription as string

          return {
            title: endedStatisticsContent ? endedStatisticsContent.displayName : '',
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

interface EndedStatistic {
  title: string
  preamble: string
  href: string
}
