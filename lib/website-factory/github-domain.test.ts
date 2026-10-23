describe('Website Factory GitHub & Domain Integration', () => {
  it('should parse valid GitHub repository URLs', () => {
    const testUrls = [
      'https://github.com/facebook/react',
      'https://github.com/vercel/next.js.git',
      'tailwindlabs/tailwindcss',
    ]

    for (const url of testUrls) {
      const clean = url.trim().replace(/\.git$/, '').replace(/\/$/, '')
      const match = clean.match(/github\.com\/([^\/]+)\/([^\/]+)/i) || clean.match(/^([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)$/)
      expect(match).not.toBeNull()
      expect(match![1]).toBeDefined()
      expect(match![2]).toBeDefined()
    }
  })

  it('should validate custom domain formats', () => {
    const validDomains = ['myagency.com', 'client.brand.ng', 'sub.domain.co.uk']
    const invalidDomains = ['invalid', 'http://', '']

    for (const d of validDomains) {
      const clean = d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
      expect(clean.includes('.')).toBe(true)
      expect(clean.length).toBeGreaterThanOrEqual(4)
    }

    for (const d of invalidDomains) {
      const clean = d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
      expect(clean.includes('.') && clean.length >= 4).toBe(false)
    }
  })
})
