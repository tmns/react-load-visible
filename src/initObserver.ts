import type { ObserverOptions, InitObserverTuple, VisibleHandler } from './types'
import { isObserverAvailable } from './utils'

// Note that the below two variables are only instantiated once.
// A mapping of our observed elements to their `handleOnVisible` functions.
const trackedElements = new Map<Element, VisibleHandler>()
// Our `IntersectionObserver` instance.
let observer: IntersectionObserver | undefined

// This function allows for passing custom options to the observer instantiation.
// In the event that it has been called already, it simply returns the current values.
function initObserver(observerOptions?: ObserverOptions): InitObserverTuple {
  if (!observer && isObserverAvailable()) {
    observer = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const onVisibleHandler = trackedElements.get(entry.target)

        if (onVisibleHandler && (entry.isIntersecting || entry.intersectionRatio > 0)) {
          onVisibleHandler()
        }
      })
    }, observerOptions)
  }

  return [trackedElements, observer]
}

export default initObserver
