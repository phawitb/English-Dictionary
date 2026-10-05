import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('PWA manifest', () => {
  it('defines an installable standalone Sisu app with local icons', () => {
    const manifest = JSON.parse(readFileSync(resolve('public/manifest.webmanifest'), 'utf8'))

    expect(manifest).toMatchObject({
      name: 'Sisu — Learn English',
      short_name: 'Sisu',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: '#f4f8f8',
      background_color: '#f4f8f8',
    })
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: '/icons/icon-192.png', sizes: '192x192' }),
      expect.objectContaining({ src: '/icons/icon-512.png', sizes: '512x512' }),
      expect.objectContaining({ src: '/icons/icon-maskable-512.png', purpose: 'maskable' }),
    ]))
  })
})
