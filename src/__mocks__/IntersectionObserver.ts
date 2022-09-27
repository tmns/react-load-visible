import { ObserverOptions } from '..'

const elementVisibilityStates = {
  byIntersecting: {
    isIntersecting: true,
    intersectionRatio: 0,
  },
  byRatio: {
    isIntersecting: undefined,
    intersectionRatio: 0.1,
  },
}

const intersectionObservers: MockObserver[] = []
export const globallyTrackedElements: Element[] = []

export function makeElementsVisible(mode: 'byIntersecting' | 'byRatio' = 'byRatio') {
  const intersectionObject = elementVisibilityStates[mode]
  intersectionObservers.forEach((observer) => {
    const entries = observer.trackedElements.map((element) => {
      return {
        ...intersectionObject,
        target: element,
      }
    })

    observer.callback(entries, observer)
  })
}

type MockObserverEntry = {
  target: Element
  isIntersecting?: boolean
  intersectionRatio: number
}

type MockObserverCallback = {
  (entries: MockObserverEntry[], observer: IntersectionObserver): void
}

export class MockObserver {
  root: Element | null
  rootMargin: string
  thresholds: number[]

  entries: IntersectionObserverEntry[] = []

  callback: MockObserverCallback
  trackedElements: Element[]

  constructor(fn: MockObserverCallback, options?: ObserverOptions) {
    this.callback = fn

    this.trackedElements = []

    this.root = (options?.root as Element) || null
    this.rootMargin = options?.rootMargin || '0px'

    this.thresholds = []
    if (options?.threshold) {
      if (Array.isArray(options.threshold)) this.thresholds = [...options.threshold]
      else if (typeof options.threshold === 'number') this.thresholds.push(options.threshold)
    }

    intersectionObservers.push(this)
  }

  observe(element: Element) {
    this.trackedElements.push(element)
    globallyTrackedElements.push(element)
  }

  unobserve(element: Element) {
    const elementIndex = this.trackedElements.indexOf(element)

    if (elementIndex >= 0) {
      this.trackedElements.splice(elementIndex, 1)
    }

    const globalIndex = globallyTrackedElements.indexOf(element)

    if (globalIndex >= 0) {
      globallyTrackedElements.splice(elementIndex, 1)
    }
  }

  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return this.entries
  }
}
