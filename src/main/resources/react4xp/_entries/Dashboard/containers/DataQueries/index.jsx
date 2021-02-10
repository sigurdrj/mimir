import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { DataQueryTable } from './DataQueryTable'
import { selectLoadingErrors, selectDataQueriesByParentType, selectLoadingDefaultDataSources } from './selectors'
import { requestErrorQueries, requestDefaultDataSources } from './actions'
import { FactPageQueries } from './FactPageQueries'
import { StatisticsQueries } from './StatisticsQueries'
import { MunicipalQueries } from './MunicipalQueries'

export function DataQueries() {
  function renderDataQueryTables() {
    return (
      <React.Fragment>
        <DataQueryTable
          header="Spørringer som feilet"
          querySelector={selectDataQueriesByParentType('error')}
          loadingSelector={selectLoadingErrors}
          requestQueries={requestErrorQueries}
          openByDefault={true}
        />
        <FactPageQueries/>
        <StatisticsQueries/>
        <MunicipalQueries/>
        <DataQueryTable
          header="Andre"
          querySelector={selectDataQueriesByParentType('default')}
          loadingSelector={selectLoadingDefaultDataSources}
          requestQueries={requestDefaultDataSources}
        />
      </React.Fragment>
    )
  }

  return (
    <section className="xp-part part-dashboard container mb-5">
      <Row>
        <Col>
          <div className="p-4 tables-wrapper border-top-0">
            <h2 className="mb-3">{`Spørringer mot statistikkbank og tabellbygger`}</h2>
            {renderDataQueryTables()}
          </div>
        </Col>
      </Row>
    </section>
  )
}

export default (props) => <DataQueries {...props} />
