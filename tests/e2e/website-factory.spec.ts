import { expect, test } from '@playwright/test'

test('Website Factory protects the production workspace behind authentication', async ({ page }) => {
  await page.goto('/website-factory')
  await expect(page).toHaveURL(/\/login/)
})

test('Website Factory preview endpoint does not expose unauthenticated project output', async ({ request }) => {
  const response = await request.get('/api/website-factory/build/unknown/preview')
  expect([401, 404]).toContain(response.status())
})
