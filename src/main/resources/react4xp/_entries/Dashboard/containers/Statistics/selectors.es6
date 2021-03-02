import { createSelector } from '@reduxjs/toolkit'
import { initialState } from './slice'

// First select the relevant part from the state
const selectDomain = (state) => state.statistics || initialState

export const selectLoading = createSelector(
  [selectDomain],
  (statisticsState) => statisticsState.loading,
)

export const selectStatistics = createSelector(
  [selectDomain],
  (statisticsState) => statisticsState.statistics,
)

export const selectStatisticsWithRelease = createSelector(
  [selectDomain],
  (statisticsState) => statisticsState.statistics.filter((s) => !!s.nextRelease)
)

export const selectOpenStatistic = createSelector(
  [selectDomain],
  (statisticsState) => {
    return statisticsState.statistics.find((s) => s.id === statisticsState.openStatistic)
  }
)

export const selectHasLoadingStatistic = createSelector(
  [selectDomain],
  (statisticsState) => statisticsState.statistics.filter((s) => s.loading).length > 0
)

export const selectModalDisplay = createSelector(
  [selectDomain],
  (statisticsState) => statisticsState.modalDisplay
)

export const selectRefreshMessages = createSelector(
  [selectDomain],
  (statisticsState) => statisticsState.updateMessage
)

export const selectOpenModal = createSelector(
  [selectDomain],
  (statisticsState) => statisticsState.openModal
)

export const selectLoadingSearchList = createSelector(
  [selectDomain],
  (statisticsState) => statisticsState.loadingSearchList,
)

export const selectSearchList = createSelector(
  [selectDomain],
  (statisticsState) => statisticsState.statisticsSearchList,
)

export const selectStatistic = (statisticId) => {
  return createSelector(
    [selectDomain],
    (statisticsState) => statisticsState.statistics.find((s) => s.id === statisticId)
  )
}

export const selectStatisticsLogDataLoaded = (statisticId) => {
  return createSelector(
    [selectDomain],
    (statisticsState) => statisticsState.statistics.find((s) => s.id === statisticId).logDataLoaded
  )
}

export const selectJobLog = (statisticId, jobId) => {
  return createSelector(
    [selectDomain],
    (statisticsState) => {
      const stat = statisticsState.statistics.find((statLog) => statLog.id === statisticId)
      if (stat && stat.logData) {
        const jobLog = stat.logData.find((jobLog) => jobLog.id === jobId)
        return jobLog
      }
      return null
    }
  )
}

export const selectJobLogDetails = (statisticId, jobId) => {
  return createSelector(
    [selectDomain],
    (state) => {
      const stat = state.statistics ? state.statistics.find((statLog) => statLog.id === statisticId) : []
      if (stat && stat.logs) {
        const log = stat.logs.find((log) => log.jobId === jobId)
        return log
      }
      return null
    }
  )
}

export const selectJobLogDetailsLoaded = (statisticId, jobId) => {
  console.log(statisticId + ' - ' + jobId)
  return createSelector(
    [selectDomain],
    (state) => {
      const stat = state.statistics ? state.statistics.find((s) => s.id === statisticId) : []
      if (stat && stat.logs) {
        const log = stat.logs.find((log) => log.jobId === jobId)
        return !!log
      }
      return false
    })
}
