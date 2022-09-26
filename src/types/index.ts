import { DefaultComponent, Options } from '@loadable/component'

export type LoadFn<Props> = (props: Props) => Promise<DefaultComponent<Props>>

export type LoadOptions<Props> = Options<Props> | undefined

export interface WrapperProps {
  wrapperCss?: { string: string | number }
}

export interface ObserverOptions {
  root?: Element | Document
  rootMargin?: string
  threshold?: number | number[]
}

export type InitObserverTuple = [Map<Element, Function>, IntersectionObserver | undefined]
