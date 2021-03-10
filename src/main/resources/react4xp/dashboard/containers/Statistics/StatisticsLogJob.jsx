import PropTypes from 'prop-types'
import { Accordion, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { requestJobLogDetails } from './actions'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { selectJobLog, selectJobLogDetailsLoaded } from './selectors'
import { AlertTriangle } from 'react-feather'

export function StatisticsLogJob(props) {
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const [firstOpen, setFirstOpen] = React.useState(true)
  const logDetailsLoaded = useSelector(selectJobLogDetailsLoaded(props.statisticId, props.jobId))
  const logData = useSelector(selectJobLog(props.statisticId, props.jobId))

  function onToggleAccordion(isOpen) {
    if (firstOpen && isOpen ) {
      setFirstOpen(false)
      if (logData.status === 'COMPLETE') {
        requestJobLogDetails(dispatch, io, props.jobId, props.statisticId)
      }
    }
    props.setAccordionStatusOnIndex(props.index, isOpen)
  }

  function setNestedAccordionStatus(i, nestedIsOpen) {
    props.setNestedAccordionWithIndexes(props.index, i, nestedIsOpen)
  }

  function formatTime(time) {
    return moment(time).locale('nb').format('DD.MM.YYYY HH.mm')
  }

  function renderAccordionBody() {
    if (logDetailsLoaded && logData.details) {
      return logData.details.map((log, i) => {
        return (
          <NestedAccordion
            key={i}
            header={`${log.displayName} (${log.branch})`}
            className="mx-0"
            openByDefault={props.nestedAccordionStatus && !!props.nestedAccordionStatus[i]}
            onToggle={(nestedIsOpen) => setNestedAccordionStatus(i, nestedIsOpen)}>
            <ul>
              {log.eventLogResult.map((logNode, k) => {
                return (
                  <p key={k}>
                    <span>{logNode.modifiedTs}</span> - <span>{logNode.by}</span><br/>
                    <span> &gt; {logNode.result}</span>
                  </p>
                )
              })}
            </ul>
          </NestedAccordion>
        )
      })
    } else {
      return (
        <span className="spinner-border spinner-border" />
      )
    }
  }

  return (
    <Accordion
      key={props.jobId}
      className={logData.status}
      header={`${formatTime(logData.startTime)}: ${logData.task} (${logData.status})`}
      onToggle={(isOpen) => onToggleAccordion(isOpen)}
      openByDefault={props.accordionOpenStatus}
    >
      <span>Initiert av {logData.user.displayName}</span>
      {renderAccordionBody()}
    </Accordion>
  )
}

StatisticsLogJob.propTypes = {
  statisticId: PropTypes.string,
  jobId: PropTypes.string,
  accordionOpenStatus: PropTypes.bool,
  setAccordionStatusOnIndex: PropTypes.func,
  index: PropTypes.number,
  nestedAccordionStatus: PropTypes.array,
  setNestedAccordionWithIndexes: PropTypes.func
}
