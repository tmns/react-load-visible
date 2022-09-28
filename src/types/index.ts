import { DefaultComponent, Options, ExtraComponentProps } from '@loadable/component'

export type LoadFn<Props> = (props: Props) => Promise<DefaultComponent<Props>>

export type LoadOptions<Props> = Options<Props> | undefined

export type WrapperProps = {
  wrapperCss?: { [key: string]: string | number }
}

export type AnyProps = {
  [x: string]: any
}

export type OnVisibleComponentProps<Props> = Props & AnyProps & WrapperProps & ExtraComponentProps

export type ObserverOptions = {
  root?: Element | Document
  rootMargin?: string
  threshold?: number | number[]
}

export type VisibleHandler = () => void
export type InitObserverTuple = [Map<Element, VisibleHandler>, IntersectionObserver | undefined]
