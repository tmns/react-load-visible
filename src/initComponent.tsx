import React, { useState, useRef, useEffect } from 'react'
import loadable, { ExtraComponentProps } from '@loadable/component'
import { LoadFn, LoadOptions, WrapperProps } from './types'
import initObserver from './initObserver'
import { isObserverAvailable } from './utils'

function initComponent<Props>(loadFn: LoadFn<Props>, opts: LoadOptions<Props>) {
  // If we're in an environment without `window.IntersectionObserver`,
  // we simply early return `loadable`'s result as would be done normally.
  if (!isObserverAvailable()) return loadable(loadFn, opts)

  // This is switched to `true` the first time the returned component's
  // `load` or `preload` function is called. On subsequent calls, being
  // `true` prevents the component's `onVisibleHandlers` from rerunning.
  let isLoaded = false
  const onVisibleHandlers: Function[] = []

  // Get the `loadable` component that we will return when visible.
  const LoadableComponent = loadable(loadFn, opts)

  // Set up (or get) our map of observed elements -> `onVisibleHandlers` and observer instance.
  const [trackedElements, observer] = initObserver()

  // The "wrapping" component we return, which itself returns either the placeholder
  // `div` (optionally with a fallback) or the loaded component.
  function OnVisibleComponent(props: Props & WrapperProps & ExtraComponentProps) {
    const [isVisible, setVisible] = useState<Boolean>(isLoaded)
    const ref = useRef<HTMLDivElement>(null)

    function handleOnVisible() {
      if (ref.current) {
        observer?.unobserve(ref.current)
        trackedElements.delete(ref.current)
      }

      setVisible(true)
    }

    useEffect(() => {
      if (isVisible || !ref.current) return

      // If visibility hasn't been triggered yet, we need to ensure we're
      // keeping track of our handler and element and begin observing.
      onVisibleHandlers.push(handleOnVisible)
      trackedElements.set(ref.current, handleOnVisible)
      observer?.observe(ref.current)

      // Clean up after ourselves by reversing the work performed above.
      return () => {
        const handlerIndex = onVisibleHandlers.indexOf(handleOnVisible)

        if (handlerIndex >= 0) onVisibleHandlers.splice(handlerIndex, 1)

        if (ref.current) {
          trackedElements.delete(ref.current)
          observer?.unobserve(ref.current)
        }
      }
    }, [isVisible, ref.current])

    // If we're visible we return the component returned from `loadable`.
    if (isVisible) return <LoadableComponent {...props} />

    const { wrapperCss, ...rest } = props

    // If a fallback component was supplied either to the init'ing function or via
    // a `fallback` prop on the component, we render it within a wrapping `div`.
    const FallbackComponent = opts?.fallback
    if (FallbackComponent || props.fallback) {
      return (
        <div
          style={{
            display: 'inline-block',
            minHeight: '1px',
            minWidth: '1px',
            ...(wrapperCss || {}),
          }}
          ref={ref}
        >
          {FallbackComponent
            ? React.createElement(() => FallbackComponent, {
                isLoading: true,
                ...rest,
              })
            : props.fallback}
        </div>
      )
    }

    // Otherwise, we just return the wrapping `div` all by its lonesome.
    return (
      <div
        style={{
          display: 'inline-block',
          minHeight: '1px',
          minWidth: '1px',
          ...(wrapperCss || {}),
        }}
        ref={ref}
      />
    )
  }

  // Expose `loadable`'s builtin `preload` function.
  OnVisibleComponent.preload = () => {
    if (!isLoaded) {
      isLoaded = true
      onVisibleHandlers.forEach((handler) => handler())
    }
    return LoadableComponent.preload()
  }

  // Expose `loadable`'s builtin `load` function.
  OnVisibleComponent.load = () => {
    if (!isLoaded) {
      isLoaded = true
      onVisibleHandlers.forEach((handler) => handler())
    }
    return LoadableComponent.load()
  }

  return OnVisibleComponent
}

export default initComponent
