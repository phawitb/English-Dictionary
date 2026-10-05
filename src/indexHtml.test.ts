import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('mobile page setup', () => {
  it('uses the device width so mobile responsive styles activate', () => {
    document.documentElement.innerHTML = readFileSync(resolve('index.html'), 'utf8')

    expect(document.querySelector('meta[name="viewport"]')).toHaveAttribute(
      'content',
      'width=device-width, initial-scale=1.0',
    )
  })

  it('links the web app manifest and iPhone home-screen metadata', () => {
    document.documentElement.innerHTML = readFileSync(resolve('index.html'), 'utf8')

    expect(document.querySelector('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest')
    expect(document.querySelector('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/apple-touch-icon.png')
    expect(document.querySelector('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes')
  })
})
