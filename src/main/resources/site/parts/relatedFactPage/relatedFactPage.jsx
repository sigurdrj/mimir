import React, { useState, useRef, useEffect } from 'react'
import { PictureCard, Button } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { get } from 'axios'

function RelatedBoxes(props) {
  const {
    firstRelatedContents,
    relatedFactPageServiceUrl,
    partConfig,
    showAll,
    showLess,
    mainTitle,
    showingPhrase,
    factpagePluralName,
  } = props

  const [relatedFactPages, setRelatedFactPages] = useState(
    firstRelatedContents ? firstRelatedContents.relatedFactPages : []
  )
  const [total, setTotal] = useState(firstRelatedContents ? firstRelatedContents.total : 0)
  const [loading, setLoading] = useState(false)
  const [focusElement, setFocusElement] = useState(false)
  const currentElement = useRef(null)

  useEffect(() => {
    if (focusElement && currentElement.current) {
      currentElement.current.firstChild.focus()
    }
  }, [relatedFactPages])

  function fetchAllRelatedFactPages() {
    setLoading(true)
    get(relatedFactPageServiceUrl, {
      params: {
        start: relatedFactPages.length,
        count: total - relatedFactPages.length,
        partConfig,
      },
    })
      .then((res) => {
        if (res.data.relatedFactPages.length) {
          setRelatedFactPages((prev) => [...prev, ...res.data.relatedFactPages])
          setTotal(res.data.total)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function fetchFirstRelatedFactPages() {
    setLoading(true)
    get(relatedFactPageServiceUrl, {
      params: {
        start: 0,
        count: 4,
        partConfig,
      },
    })
      .then((res) => {
        if (res.data.relatedFactPages.length) {
          setRelatedFactPages(res.data.relatedFactPages)
          setTotal(res.data.total)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function handleButtonOnClick() {
    if (total === relatedFactPages.length) {
      fetchFirstRelatedFactPages()
    } else {
      fetchAllRelatedFactPages()
    }
  }

  function renderButtonText() {
    if (!loading) {
      if (total > relatedFactPages.length) {
        return `${showAll} (${total})`
      } else {
        return showLess
      }
    } else {
      return <span className='spinner-border spinner-border-sm' />
    }
  }

  function renderRelatedFactPages() {
    if (relatedFactPages.length) {
      return (
        <>
          <div className='row'>
            <ul
              className='image-box-wrapper'
              aria-label={`${showingPhrase.replace('{0}', relatedFactPages.length)} ${total} ${factpagePluralName}`}
            >
              {relatedFactPages.map((relatedFactPageContent, index) => (
                <li key={index} ref={index === 4 ? currentElement : null}>
                  <PictureCard
                    className='mb-3'
                    imageSrc={relatedFactPageContent.image}
                    altText={relatedFactPageContent.imageAlt ?? ''}
                    link={relatedFactPageContent.link}
                    title={relatedFactPageContent.title}
                  />
                </li>
              ))}
            </ul>
          </div>
          {total > 4 && (
            <div className='row'>
              <div className='col-auto'>
                <Button
                  ariaLabel={total > relatedFactPages.length && `${showAll} - ${total} ${factpagePluralName}`}
                  onClick={handleButtonOnClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setFocusElement((prev) => !prev)
                      handleButtonOnClick()
                    }
                  }}
                >
                  {renderButtonText()}
                </Button>
              </div>
            </div>
          )}
        </>
      )
    }
    return
  }

  return (
    <div className='container'>
      <h2>{mainTitle}</h2>
      {renderRelatedFactPages()}
    </div>
  )
}

RelatedBoxes.propTypes = {
  firstRelatedContents: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      link: PropTypes.string,
      image: PropTypes.string,
      imageAlt: PropTypes.string,
    })
  ),
  relatedFactPageServiceUrl: PropTypes.string,
  partConfig: PropTypes.string,
  showAll: PropTypes.string,
  showLess: PropTypes.string,
  mainTitle: PropTypes.string,
  factpagePluralName: PropTypes.string,
  showingPhrase: PropTypes.string,
}

export default (props) => <RelatedBoxes {...props} />
