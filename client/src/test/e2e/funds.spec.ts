import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Listado de fondos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('muestra el listado de fondos al cargar', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible()
    const rows = page.getByRole('row')
    await expect(rows).not.toHaveCount(0)
  })

  test('ordena por nombre al clicar la cabecera', async ({ page }) => {
    const nameHeader = page.getByRole('columnheader', { name: /nombre/i })
    await nameHeader.getByRole('button').click()
    await expect(nameHeader.getByRole('button')).toHaveAttribute('aria-sort', 'ascending')
  })

  test('pagina al clicar siguiente', async ({ page }) => {
    await page.getByRole('button', { name: /siguiente/i }).click()
    await expect(page.getByText(/página 2/i)).toBeVisible()
  })

  test('flujo completo de compra', async ({ page }) => {
    // Abrir menú de acciones del primer fondo
    await page.getByRole('button', { name: /acciones/i }).first().click()
    await page.getByRole('menuitem', { name: /comprar/i }).click()

    // Dialog visible
    await expect(page.getByRole('dialog', { name: /comprar/i })).toBeVisible()

    // Rellenar importe
    await page.getByLabel(/importe/i).fill('500')

    // Confirmar
    await page.getByRole('button', { name: /confirmar/i }).click()

    // Dialog cerrado
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('no tiene violaciones de accesibilidad en el listado', async ({ page }) => {
    await page.getByRole('table').waitFor()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toHaveLength(0)
  })
})
