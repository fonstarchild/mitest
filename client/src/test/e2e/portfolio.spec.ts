import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Cartera', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Mi cartera' }).click()
    await page.getByRole('tablist').waitFor()
  })

  test('muestra la pestaña Fondos activa por defecto', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /fondos/i })).toHaveAttribute('aria-selected', 'true')
  })

  test('muestra posiciones de la cartera o estado vacío', async ({ page }) => {
    const hasFunds = await page.getByRole('article').first().isVisible().catch(() => false)
    const hasEmpty = await page.getByText(/no tienes posiciones/i).isVisible().catch(() => false)
    expect(hasFunds || hasEmpty).toBe(true)
  })

  test('flujo completo de venta', async ({ page }) => {
    await page.getByRole('button', { name: 'Fondos' }).click()
    await page.getByRole('button', { name: /acciones/i }).first().click()
    await page.getByRole('menuitem', { name: /comprar/i }).click()
    await expect(page.getByRole('dialog', { name: /comprar/i })).toBeVisible()
    await page.getByLabel(/importe/i).fill('500')
    await page.getByRole('button', { name: /confirmar compra/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    await page.getByRole('button', { name: 'Mi cartera' }).click()
    await page.getByRole('tablist').waitFor()
    await page.getByRole('button', { name: /acciones/i }).first().click()
    await page.getByRole('menuitem', { name: /vender/i }).click()
    await expect(page.getByRole('dialog', { name: /vender/i })).toBeVisible()
    await page.getByLabel(/importe/i).fill('1')
    await page.getByRole('button', { name: /confirmar venta/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('flujo completo de traspaso', async ({ page }) => {
    await page.getByRole('button', { name: 'Fondos' }).click()
    for (const nth of [0, 1]) {
      await page.getByRole('button', { name: /acciones/i }).nth(nth).click()
      await page.getByRole('menuitem', { name: /comprar/i }).click()
      await expect(page.getByRole('dialog', { name: /comprar/i })).toBeVisible()
      await page.getByLabel(/importe/i).fill('300')
      await page.getByRole('button', { name: /confirmar compra/i }).click()
      await expect(page.getByRole('dialog')).not.toBeVisible()
    }

    await page.getByRole('button', { name: 'Mi cartera' }).click()
    await page.getByRole('tablist').waitFor()
    await page.getByRole('button', { name: /acciones/i }).first().click()
    await page.getByRole('menuitem', { name: /traspasar/i }).click()
    await expect(page.getByRole('dialog', { name: /traspasar/i })).toBeVisible()

    const select = page.getByRole('combobox', { name: /destino/i })
    await select.selectOption({ index: 1 })
    await expect(select).not.toHaveValue('')

    await page.getByLabel(/importe/i).fill('1')
    await page.getByRole('button', { name: /confirmar traspaso/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('no tiene violaciones de accesibilidad en la cartera', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toHaveLength(0)
  })
})
