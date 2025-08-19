declare module 'qr-code-styling' {
  export type DotType = 'square' | 'rounded' | 'dots'
  export type CornerSquareType = 'square' | 'extra-rounded' | 'dot'
  export type CornerDotType = 'dot' | 'square'
  export type Extension = 'svg' | 'png' | 'jpeg'

  export interface QRCodeOptions {
    width?: number
    height?: number
    type?: 'canvas' | 'svg'
    data?: string
    image?: string
    element?: HTMLElement | null
    margin?: number
    qrOptions?: {
      typeNumber?: number
      mode?: 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji'
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    }
    dotsOptions?: {
      color?: string
      type?: DotType
    }
    backgroundOptions?: {
      color?: string
    }
    cornersSquareOptions?: {
      type?: CornerSquareType
    }
    cornersDotOptions?: {
      type?: CornerDotType
    }
    imageOptions?: {
      crossOrigin?: string
      margin?: number
      hideBackgroundDots?: boolean
      imageSize?: number
      saveAsBlob?: boolean
    }
  }

  export default class QRCodeStyling {
    constructor(options?: QRCodeOptions)
    update(options?: Partial<QRCodeOptions>): void
    append(element: HTMLElement | null): void
    download(options?: { name?: string; extension?: Extension }): void
    applyExtension(extension: (svg: SVGSVGElement, options: any) => void): void
    deleteExtension(): void
  }
}
