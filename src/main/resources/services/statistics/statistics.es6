__non_webpack_require__('/lib/polyfills/nashorn')
const {
  getAllStatisticsFromRepo,
  handleRepoGet
} = __non_webpack_require__('/lib/repo/statreg/statistics')

const toOption = (stat) => ({
  ...stat,
  displayName: stat.shortName,
  description: stat.name
})

const filterByShortName = (stats, filters) => {
  if (!filters.query) {
    return stats
  }

  log.info(`searching ${filters.query} in ${stats.length} stats`)
  return stats.filter((s) => s.shortName.toLowerCase().includes(filters.query.toLowerCase()))
}

const filterByIds = (stats, filters) => {
  return filters.ids && filters.ids.split(',')
    .reduce((acc, id) => {
      const found = stats.find((s) => `${s.id}` === id)
      return found ? acc.concat(found) : acc
    }, [])
}

exports.get = (req) => {
  return handleRepoGet(
    req,
    'Statistics',
    getAllStatisticsFromRepo,
    toOption,
    req.params.ids ? filterByIds : filterByShortName)
}
