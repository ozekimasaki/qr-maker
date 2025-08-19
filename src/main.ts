import QRCodeStyling from 'qr-code-styling'
import './style.css'

type DotType = 'square' | 'rounded' | 'dots'
type CornerType = 'square' | 'dot' | 'extra-rounded'
type Extension = 'svg' | 'png' | 'jpeg'

document.addEventListener('DOMContentLoaded', () => {
  const canvasEl = document.getElementById('canvas') as HTMLElement | null
  if (!canvasEl) {
    console.error('#canvas element not found')
    return
  }

  const urlInput = document.getElementById('url-input') as HTMLInputElement | null
  const dotColorInput = document.getElementById('dot-color-input') as HTMLInputElement | null
  const bgColorInput = document.getElementById('bg-color-input') as HTMLInputElement | null
  const dotTypeSelect = document.getElementById('dot-type-select') as HTMLSelectElement | null
  const cornerTypeSelect = document.getElementById('corner-type-select') as HTMLSelectElement | null
  const imageInput = document.getElementById('image-input') as HTMLInputElement | null

  const widthRange = document.getElementById('width-range') as HTMLInputElement | null
  const heightRange = document.getElementById('height-range') as HTMLInputElement | null
  const marginRange = document.getElementById('margin-range') as HTMLInputElement | null
  const errorLevelSelect = document.getElementById('error-level-select') as HTMLSelectElement | null
  const logoSizeRange = document.getElementById('logo-size-range') as HTMLInputElement | null
  const logoRoundRange = document.getElementById('logo-roundness-range') as HTMLInputElement | null
  const widthValue = document.getElementById('width-value') as HTMLElement | null
  const heightValue = document.getElementById('height-value') as HTMLElement | null
  const resetSizeBtn = document.getElementById('reset-size') as HTMLButtonElement | null

  const downloadSvgBtn = document.getElementById('download-svg') as HTMLButtonElement | null
  const downloadPngBtn = document.getElementById('download-png') as HTMLButtonElement | null
  const downloadJpegBtn = document.getElementById('download-jpeg') as HTMLButtonElement | null

  const initialData = urlInput?.value?.trim() || 'https://example.com'
  const initialWidth = parseInt(widthRange?.value || '320', 10)
  const initialHeight = parseInt(heightRange?.value || '320', 10)
  const initialMargin = parseInt(marginRange?.value || '0', 10)
  const initialError = (errorLevelSelect?.value as 'L' | 'M' | 'Q' | 'H') || 'Q'
  const initialLogoSize = parseFloat(logoSizeRange?.value || '0.4')
  const setWidthLabel = (v: number) => {
    if (widthValue) widthValue.textContent = `${v} px`
  }
  const setHeightLabel = (v: number) => {
    if (heightValue) heightValue.textContent = `${v} px`
  }

  const qrCode = new QRCodeStyling({
    width: initialWidth,
    height: initialHeight,
    type: 'svg',
    data: initialData,
    image: undefined,
    margin: initialMargin,
    qrOptions: {
      errorCorrectionLevel: initialError
    },
    dotsOptions: {
      color: dotColorInput?.value || '#000000',
      type: (dotTypeSelect?.value as DotType) || 'square'
    },
    backgroundOptions: {
      color: bgColorInput?.value || '#ffffff'
    },
    // 初期は外側: square / 内側ドット: dot
    cornersSquareOptions: {
      type: 'square'
    },
    cornersDotOptions: {
      type: 'dot'
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 0,
      imageSize: initialLogoSize
    },
    // ユーザー指定: elementに#canvasを渡す
    element: canvasEl
  } as unknown as ConstructorParameters<typeof QRCodeStyling>[0])

  // ライブラリがelementオプションに対応しない場合のフォールバック
  try {
    // すぐにappendしても重複描画にはならない想定
    qrCode.append?.(canvasEl)
  } catch (_) {
    // ignore
  }
  // 初期ラベル表示
  setWidthLabel(initialWidth)
  setHeightLabel(initialHeight)

  // ロゴ角丸の拡張（clipPath）を適用/再適用
  const getLogoRoundPercent = () => parseFloat(logoRoundRange?.value || '12')
  const buildLogoRoundExtension = (percent: number) => (svg: SVGSVGElement) => {
    const img = svg.querySelector('image') as SVGImageElement | null
    if (!img) return
    const x = parseFloat(img.getAttribute('x') || '0')
    const y = parseFloat(img.getAttribute('y') || '0')
    const w = parseFloat(img.getAttribute('width') || '0')
    const h = parseFloat(img.getAttribute('height') || '0')
    const r = Math.min(w, h) * (percent / 100)

    // 古いclipPathを削除
    const old = svg.querySelector('#qr-logo-clip')
    if (old && old.parentNode) old.parentNode.removeChild(old)

    // defs確保
    let defs = svg.querySelector('defs') as SVGDefsElement | null
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs') as SVGDefsElement
      svg.insertBefore(defs, svg.firstChild)
    }

    const cp = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
    cp.setAttribute('id', 'qr-logo-clip')
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', String(x))
    rect.setAttribute('y', String(y))
    rect.setAttribute('width', String(w))
    rect.setAttribute('height', String(h))
    rect.setAttribute('rx', String(r))
    rect.setAttribute('ry', String(r))
    cp.appendChild(rect)
    defs.appendChild(cp)
    img.setAttribute('clip-path', 'url(#qr-logo-clip)')
  }

  const reapplyExtension = () => {
    try {
      ;(qrCode as any).deleteExtension?.()
    } catch (_) {}
    try {
      ;(qrCode as any).applyExtension?.(buildLogoRoundExtension(getLogoRoundPercent()))
    } catch (_) {}
  }

  // 初回適用（画像がない場合は何もしない）
  reapplyExtension()

  // イベント: テキスト/URL
  urlInput?.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value
    qrCode.update({ data: value })
    reapplyExtension()
  })

  // イベント: ドット色
  dotColorInput?.addEventListener('input', (e) => {
    const color = (e.target as HTMLInputElement).value
    qrCode.update({ dotsOptions: { color } })
    reapplyExtension()
  })

  // イベント: 背景色
  bgColorInput?.addEventListener('input', (e) => {
    const color = (e.target as HTMLInputElement).value
    qrCode.update({ backgroundOptions: { color } })
    reapplyExtension()
  })

  // イベント: ドット形状
  dotTypeSelect?.addEventListener('change', (e) => {
    const type = (e.target as HTMLSelectElement).value as DotType
    qrCode.update({ dotsOptions: { type } })
    reapplyExtension()
  })

  // イベント: コーナー形状
  cornerTypeSelect?.addEventListener('change', (e) => {
    const type = (e.target as HTMLSelectElement).value as CornerType
    if (type === 'dot') {
      // 外側の角を 'dot' に更新し、内側ドットも 'dot' に合わせる
      qrCode.update({
        cornersSquareOptions: { type: 'dot' },
        cornersDotOptions: { type: 'dot' }
      })
    } else {
      // 外側の角タイプを反映し、内側は 'square' に戻す
      qrCode.update({
        cornersSquareOptions: { type: type as Exclude<CornerType, 'dot'> },
        cornersDotOptions: { type: 'square' }
      })
    }
    reapplyExtension()
  })

  // イベント: 中央画像
  let lastObjectUrl: string | null = null
  imageInput?.addEventListener('change', () => {
    const file = imageInput.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    qrCode.update({ image: objectUrl })
    if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl)
    lastObjectUrl = objectUrl
    reapplyExtension()
  })

  // 新規: サイズ/余白/誤り訂正/ロゴサイズ/角丸
  widthRange?.addEventListener('input', (e) => {
    const v = parseInt((e.target as HTMLInputElement).value, 10)
    qrCode.update({ width: v })
    setWidthLabel(v)
    reapplyExtension()
  })

  heightRange?.addEventListener('input', (e) => {
    const v = parseInt((e.target as HTMLInputElement).value, 10)
    qrCode.update({ height: v })
    setHeightLabel(v)
    reapplyExtension()
  })

  marginRange?.addEventListener('input', (e) => {
    const v = parseInt((e.target as HTMLInputElement).value, 10)
    qrCode.update({ margin: v })
    reapplyExtension()
  })

  errorLevelSelect?.addEventListener('change', (e) => {
    const level = (e.target as HTMLSelectElement).value as 'L' | 'M' | 'Q' | 'H'
    qrCode.update({ qrOptions: { errorCorrectionLevel: level } })
    reapplyExtension()
  })

  logoSizeRange?.addEventListener('input', (e) => {
    const v = parseFloat((e.target as HTMLInputElement).value)
    qrCode.update({ imageOptions: { imageSize: v } as any })
    reapplyExtension()
  })

  logoRoundRange?.addEventListener('input', () => {
    reapplyExtension()
  })

  // Reset size button
  resetSizeBtn?.addEventListener('click', () => {
    const def = 320
    if (widthRange) widthRange.value = String(def)
    if (heightRange) heightRange.value = String(def)
    setWidthLabel(def)
    setHeightLabel(def)
    qrCode.update({ width: def, height: def })
    reapplyExtension()
  })

  // ダウンロード
  const handleDownload = (ext: Extension) => {
    qrCode.download({ name: 'qrcode', extension: ext })
  }

  downloadSvgBtn?.addEventListener('click', () => handleDownload('svg'))
  downloadPngBtn?.addEventListener('click', () => handleDownload('png'))
  downloadJpegBtn?.addEventListener('click', () => handleDownload('jpeg'))
})
