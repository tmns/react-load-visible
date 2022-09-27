import React from 'react'
import { cleanup, render, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import {
  MockObserver,
  globallyTrackedElements,
  makeElementsVisible,
} from '../__mocks__/IntersectionObserver'

import loadable from '@loadable/component'
import loadOnVisible from '..'

jest.mock('@loadable/component')

const loadedComponent = jest.fn(() => <div data-testid="loaded-component" />)

const loader = () => Promise.resolve(loadedComponent)

const Fallback = () => <div data-testid="fallback" />

const opts = {
  fallback: <Fallback />,
}

const props = { wrapperCss: { minHeight: '300px' } }

describe('when IntersectionObserver is available', () => {
  beforeAll(() => {
    window.IntersectionObserver = MockObserver as any
  })

  beforeEach(() => {
    const mockedLoadable = jest.mocked(loadable)
    mockedLoadable.mockImplementation(jest.requireActual('@loadable/component').default)

    globallyTrackedElements.length = 0
    jest.resetModules()
    jest.clearAllMocks()
    cleanup()
  })

  it('exports', () => {
    expect(typeof loadOnVisible).toBe('function')
  })

  it('calls `loadable` but does not return the `loadable` component', () => {
    const mockedLoadable = jest.mocked(loadable)
    mockedLoadable.mockImplementation()

    const OnVisibleComponent = loadOnVisible(loader, opts)

    expect(loadable).toHaveBeenCalledWith(loader, opts)
    expect(OnVisibleComponent).not.toBe(loadable(loader))
  })

  it('loads component code when isIntersecting is true', async () => {
    const OnVisibleComponent = loadOnVisible(loader)

    const { getByTestId } = render(<OnVisibleComponent {...props} />)

    expect(loadedComponent).not.toHaveBeenCalled()

    act(() => makeElementsVisible('byIntersecting'))

    await waitFor(() => expect(getByTestId('loaded-component')).toBeInTheDocument())

    expect(loadedComponent).toHaveBeenCalledWith(props, expect.anything())
  })

  it('loads component code when intersectionRatio is > 0', async () => {
    const OnVisibleComponent = loadOnVisible(loader, opts)

    const { getByTestId } = render(<OnVisibleComponent {...props} />)

    expect(loadedComponent).not.toHaveBeenCalled()

    act(() => makeElementsVisible('byRatio'))

    await waitFor(() => expect(getByTestId('loaded-component')).toBeInTheDocument())

    expect(loadedComponent).toHaveBeenCalledWith(props, expect.anything())
  })

  it('clears out tracked elements when they become visible', async () => {
    const OnVisibleComponent = loadOnVisible(loader, opts)

    render(<OnVisibleComponent {...props} />)

    expect(globallyTrackedElements.length).toEqual(1)

    await act(async () => {
      makeElementsVisible()
    })

    expect(globallyTrackedElements.length).toEqual(0)
  })

  it('calls `loadable` preload when component preload called', () => {
    const mockedLoadable = jest.mocked(loadable)
    const mockFn = jest.fn()
    mockedLoadable.mockImplementation(
      () =>
        ({
          preload: mockFn,
        } as any),
    )

    const OnVisibleComponent = loadOnVisible(loader, opts)

    act(() => {
      OnVisibleComponent.preload()
    })

    waitFor(() => expect(mockFn).toHaveBeenCalled())
  })

  it('calls `loadable` load when component load called', async () => {
    const mockedLoadable = jest.mocked(loadable)
    const mockFn = jest.fn()
    mockedLoadable.mockImplementation(
      () =>
        ({
          load: mockFn,
        } as any),
    )

    const OnVisibleComponent = loadOnVisible(loader, opts)

    act(() => {
      OnVisibleComponent.load()
    })

    await waitFor(() => expect(mockFn).toHaveBeenCalled())
  })

  it('displays component when preload is called', async () => {
    const OnVisibleComponent = loadOnVisible(loader)

    const { queryByTestId, getByTestId } = render(<OnVisibleComponent {...props} />)
    expect(queryByTestId('loaded-component')).not.toBeInTheDocument()

    act(() => {
      OnVisibleComponent.preload()
    })

    await waitFor(() => expect(getByTestId('loaded-component')).toBeInTheDocument())
  })

  it('displays component when load is called', async () => {
    const OnVisibleComponent = loadOnVisible(loader)

    const { queryByTestId, getByTestId } = render(<OnVisibleComponent {...props} />)
    expect(queryByTestId('loaded-component')).not.toBeInTheDocument()

    act(() => {
      OnVisibleComponent.load()
    })

    await waitFor(() => expect(getByTestId('loaded-component')).toBeInTheDocument())
  })

  it('applies wrapper css to wrapper component', async () => {
    const OnVisibleComponent = loadOnVisible(loader, opts)

    render(<OnVisibleComponent {...props} />)

    expect(document.querySelector('div > div')).toHaveStyle('min-height: 300px')
  })

  it('displays fallback if passed as option', async () => {
    const OnVisibleComponent = loadOnVisible(loader, opts)

    const { getByTestId } = render(<OnVisibleComponent {...props} />)
    expect(getByTestId('fallback')).toBeInTheDocument()
  })

  it('displays fallback if passed as prop', async () => {
    const OnVisibleComponent = loadOnVisible(loader)

    const { getByTestId } = render(<OnVisibleComponent {...props} fallback={opts.fallback} />)
    expect(getByTestId('fallback')).toBeInTheDocument()
  })

  it('does not display fallback if none is passed', async () => {
    const OnVisibleComponent = loadOnVisible(loader)

    const { queryByTestId } = render(<OnVisibleComponent {...props} />)
    expect(queryByTestId('fallback')).not.toBeInTheDocument()
  })

  it('uses passed in intersection observer options', async () => {
    const { initObserver } = await import('..')

    const [, observer] = initObserver({
      root: document.body,
      rootMargin: '500px',
      threshold: 3,
    })

    expect(observer?.root instanceof HTMLBodyElement).toBeTruthy()
    expect(observer?.rootMargin).toBe('500px')
    expect(observer?.thresholds).toEqual([3])
  })

  it('does not set up visibility handlers until mounted', () => {
    const OnVisibleComponent = loadOnVisible(loader)

    expect(globallyTrackedElements.length).toEqual(0)

    render(<OnVisibleComponent />)

    expect(globallyTrackedElements.length).toEqual(1)
  })
})

describe('when IntersectionObserver is not available', () => {
  beforeAll(() => {
    window.IntersectionObserver = null as any
  })

  it('exports', () => {
    expect(typeof loadOnVisible).toBe('function')
  })

  it('returns `loadable`', () => {
    expect(loadOnVisible(loader, opts).toString()).toEqual(loadable(loader, opts).toString())
  })
})
