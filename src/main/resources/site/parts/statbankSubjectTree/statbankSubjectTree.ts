import { render } from '/lib/enonic/react4xp'
import type { SubjectItem, StatisticItem } from '/lib/ssb/utils/subjectUtils'
import type { Content } from '/lib/xp/content'
import type { StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { getContent } from '/lib/xp/portal'

const {
  getMainSubjects,
  getSubSubjects,
  getSubSubjectsByPath,
  getStatistics,
  getStatisticsByPath,
  getEndedStatisticsByPath,
  getSecondaryStatisticsBySubject,
} = __non_webpack_require__('/lib/ssb/utils/subjectUtils')
const { getAllStatisticsFromRepo } = __non_webpack_require__('/lib/ssb/statreg/statistics')

const { ensureArray } = __non_webpack_require__('/lib/ssb/utils/arrayUtils')
const { fromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')

export function get(req: XP.Request) {
  const content = getContent()
  if (!content) throw Error('No page found')

  if (req.mode === 'edit' || req.mode === 'inline') {
    return getStatbankSubjectTree(req, content)
  } else {
    return fromPartCache(req, `statbankSubjectTree-${content.language}`, () => {
      return getStatbankSubjectTree(req, content)
    })
  }
}

function getStatbankSubjectTree(req: XP.Request, content: Content) {
  const lang: string = content.language === 'en' ? 'en' : 'no'
  const allMainSubjects: Array<SubjectItem> = getMainSubjects(req, lang)
  const allSubSubjects: Array<SubjectItem> = getSubSubjects(req, lang)
  const statregStatistics: Array<StatisticInListing> = ensureArray(getAllStatisticsFromRepo())
  const statistics: Array<StatisticItem> = getStatistics(statregStatistics)
  const mainSubjects: Array<MainSubjectWithSubs> = allMainSubjects.map((subjectItem) => {
    const subSubjectsFromPath: Array<SubjectItem> = getSubSubjectsByPath(allSubSubjects, subjectItem.path)
    const preparedSubSubjects: Array<SubSubjectsWithStatistics> = subSubjectsFromPath.map((subSubject) =>
      prepareSubSubjects(subSubject, statregStatistics, statistics, content.language === 'en' ? 'en' : 'no')
    )
    return {
      ...subjectItem,
      subSubjects: preparedSubSubjects,
    }
  })
  const baseUrl: string = app.config && app.config['ssb.baseUrl'] ? app.config['ssb.baseUrl'] : 'https://www.ssb.no'
  const statbankBaseUrl: string =
    content.language && content.language === 'en' ? baseUrl + '/en/statbank/list/' : baseUrl + '/statbank/list/'
  const props: ReactProps = {
    statbankBaseUrl,
    mainSubjects,
  }
  return render('site/parts/statbankSubjectTree/statbankSubjectTree', props, req)
}

function prepareSubSubjects(
  subSubject: SubjectItem,
  statregStatistics: Array<StatisticInListing>,
  statistics: Array<StatisticItem>,
  language: string
): SubSubjectsWithStatistics {
  const statisticItems: Array<StatisticItem> = getStatisticsByPath(statistics, subSubject.path).filter(
    (s) => s.hideFromList !== true
  )

  const preparedStatistics: PreparedSubs['statistics'] = []
  statisticItems.forEach((s) => {
    const lang: string = language === 'en' ? 'en' : 'no'
    const title: string = s.titles.filter((t) => t.language === lang)[0].title
    preparedStatistics.push({
      title: title,
      url: s.shortName,
    })
  })

  const pathEndedStatisticNo: string = subSubject.path.replace('/ssb/en/', '/ssb/')
  const endedStatistics: Array<StatisticItem> = getEndedStatisticsByPath(pathEndedStatisticNo, statregStatistics, true)
  const preparedEndedStatistics: PreparedSubs['statistics'] =
    endedStatistics.length > 0
      ? endedStatistics.map((e) => {
          const lang: string = language === 'en' ? 'en' : 'no'
          const title: string = e.titles.filter((t) => t.language === lang)[0].title
          return {
            title: title,
            url: e.shortName,
          }
        })
      : []

  const secondaryStatistics: Array<StatisticItem> = getSecondaryStatisticsBySubject(statistics, subSubject)

  const preparedSecondaryStatistics: PreparedSubs['statistics'] =
    secondaryStatistics.length > 0
      ? secondaryStatistics.map((e) => {
          const lang: string = language === 'en' ? 'en' : 'no'
          const title: string = e.titles.filter((t) => t.language === lang)[0].title
          return {
            title: title,
            url: e.shortName,
          }
        })
      : []

  const allStatistics: PreparedSubs['statistics'] = [
    ...preparedStatistics,
    ...preparedEndedStatistics,
    ...preparedSecondaryStatistics,
  ].sort((a, b) => (a.title > b.title ? 1 : -1))
  return {
    ...subSubject,
    statistics: allStatistics,
  }
}

type MainSubjectWithSubs = SubjectItem & SubSubs

type SubSubjectsWithStatistics = SubjectItem & PreparedSubs

interface SubSubs {
  subSubjects: Array<PreparedSubs>
}

interface PreparedSubs {
  statistics: Array<{ title: string; url: string }>
}

interface ReactProps {
  statbankBaseUrl: string
  mainSubjects: Array<MainSubjectWithSubs>
}
