import { Socket, SocketEmitter } from '../types/socket'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/lib/content'
import { StatisticInListing, VariantInListing } from './statreg/types'
import { UtilLibrary } from '../types/util'

const {
  query
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/repo/statreg/statistics')
const util: UtilLibrary = __non_webpack_require__( '/lib/util')

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('get-statistics', () => {
    const statisticData: Array<StatisticDashboard> = prepStatistics(getStatistics())
    socket.emit('statistics-result', statisticData)
  })
}

function prepStatistics(statistics: Array<Content<Statistic>>): Array<StatisticDashboard> {
  const statisticData: Array<StatisticDashboard> = []
  statistics.map((statistic: Content<Statistic>) => {
    const statregData: StatregData | undefined = statistic.data.statistic ? getStatregInfo(statistic.data.statistic) : undefined
    if (statregData && statregData.nextRelease) {
      const statisticDataDashboard: StatisticDashboard = {
        id: statistic._id,
        language: statistic.language ? statistic.language : '',
        name: statistic._name ? statistic._name : '',
        shortName: statregData.shortName,
        nextRelease: statregData.nextRelease ? statregData.nextRelease : ''
      }
      statisticData.push(statisticDataDashboard)
    }
  })
  return sortByNextRelease(statisticData)
}

function getStatistics(): Array<Content<Statistic>> {
  let hits: Array<Content<Statistic>> = []
  const result: QueryResponse<Statistic> = query({
    contentTypes: [`${app.name}:statistics`],
    query: `data.statistic LIKE "*"`,
    count: 50
  })
  hits = hits.concat(result.hits)
  return hits
}

function getStatregInfo(key: string): StatregData | undefined {
  const statisticStatreg: StatisticInListing | undefined = getStatisticByIdFromRepo(key)
  if (statisticStatreg) {
    const variants: Array<VariantInListing> = util.data.forceArray(statisticStatreg.variants)
    const variant: VariantInListing = variants[0] // TODO: Multiple variants
    const result: StatregData = {
      shortName: statisticStatreg.shortName,
      frekvens: variant.frekvens,
      previousRelease: variant.previousRelease,
      nextRelease: variant.nextRelease ? variant.nextRelease : ''
    }
    return result
  }
  return undefined
}

function sortByNextRelease(statisticData: Array<StatisticDashboard>): Array<StatisticDashboard> {
  const statisticsSorted: Array<StatisticDashboard> = statisticData.sort((a, b) => {
    const dateA: Date | string = a.nextRelease ? new Date(a.nextRelease) : ''
    const dateB: Date | string = b.nextRelease ? new Date(b.nextRelease) : ''
    if (dateA < dateB) {
      return -1
    } else if (dateA > dateB) {
      return 1
    } else {
      return 0
    }
  })

  return statisticsSorted
}

interface StatisticDashboard {
  id: string;
  language?: string;
  name?: string;
  shortName: string;
  nextRelease?: string;
}

interface Statistic {
  statistic?: string;
  language: string;
}

interface StatregData {
  shortName: string;
  frekvens: string;
  previousRelease: string;
  nextRelease: string;
}
