import * as React from "react"
import StackTrace from "stack-trace"
import { Overlay, Header, HeaderOpenClose, Body } from "./overlay"
import { useStackFrame } from "./hooks"
import { CodeFrame } from "./code-frame"
import { getCodeFrameInformation, openInEditor } from "../utils"
import { Accordion, AccordionItem } from "./accordion"

function WrappedAccordionItem({ error, open }) {
  const stacktrace = StackTrace.parse(error)
  const codeFrameInformation = getCodeFrameInformation(stacktrace)

  const modulePath = codeFrameInformation?.moduleId
  const lineNumber = codeFrameInformation?.lineNumber
  const columnNumber = codeFrameInformation?.columnNumber
  const name = codeFrameInformation?.functionName
  // With the introduction of Metadata management the modulePath can have a resourceQuery that needs to be removed first
  const filePath = modulePath.replace(/\?export=(default|head)$/, ``)

  const res = useStackFrame({ moduleId: modulePath, lineNumber, columnNumber })
  const line = res.sourcePosition?.line

  const Title = () => {
    if (!name) {
      return <>Unknown Runtime Error</>
    }

    return (
      <>
        Error in function{` `}
        <span data-font-weight="bold">{name}</span> in{` `}
        <span data-font-weight="bold">
          {filePath}:{line}
        </span>
      </>
    )
  }

  return (
    <AccordionItem open={open} title={<Title />}>
      <p data-gatsby-overlay="body__error-message">{error.message}</p>
      <div data-gatsby-overlay="codeframe__top">
        <div>
          {filePath}:{line}
        </div>
        <button
          data-gatsby-overlay="body__open-in-editor"
          onClick={() => openInEditor(filePath, line)}
        >
          Open in Editor
        </button>
      </div>
      <CodeFrame decoded={res.decoded} />
    </AccordionItem>
  )
}

export function RuntimeErrors({ errors, dismiss }) {
  const deduplicatedErrors = React.useMemo(() => {
    const errorCache = new Set()
    const errorList = []
    errors.forEach(error => {
      // Second line contains the exact location
      const secondLine = error.stack.split(`\n`)[1]
      if (!errorCache.has(secondLine)) {
        errorList.push(error)
        errorCache.add(secondLine)
      }
    })

    return errorList
  }, [errors])
  const hasMultipleErrors = deduplicatedErrors.length > 1

  return (
    <Overlay>
      <Header data-gatsby-error-type="runtime-error">
        <div data-gatsby-overlay="header__cause-file">
          <h1 id="gatsby-overlay-labelledby">
            {hasMultipleErrors
              ? `${deduplicatedErrors.length} Unhandled Runtime Errors`
              : `Unhandled Runtime Error`}
          </h1>
        </div>
        <HeaderOpenClose dismiss={dismiss} />
      </Header>
      <Body>
        <p
          data-gatsby-overlay="body__describedby"
          id="gatsby-overlay-describedby"
        >
          {hasMultipleErrors ? `Multiple` : `One`} unhandled runtime{` `}
          {hasMultipleErrors ? `errors` : `error`} found in your files. See the
          list below to fix {hasMultipleErrors ? `them` : `it`}:
        </p>
        <Accordion>
          {deduplicatedErrors.map((error, index) => (
            <WrappedAccordionItem
              open={index === 0}
              key={`${error.message}-${index}`}
              error={error}
            />
          ))}
        </Accordion>
      </Body>
    </Overlay>
  )
}
