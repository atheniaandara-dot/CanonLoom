import { test, expect } from '@playwright/test';

test('writer can repair the example and retain it after reload', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A good story remembers.' })).toBeVisible();
  await page.locator('nav [data-view="checks"]').click();
  await expect(page.locator('article.issue')).toHaveCount(3);
  for (let i = 0; i < 3; i++)
    await page.getByRole('button', { name: 'Match recorded canon' }).first().click();
  await expect(page.locator('article.issue')).toHaveCount(0);
  await page.reload();
  await page.locator('nav [data-view="checks"]').click();
  await expect(page.locator('article.issue')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('new story form, download and local persistence work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New story', exact: true }).click();
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('The River Remembers');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Add entity', exact: true }).click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Nari');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Nari', exact: true })).toBeVisible();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup', exact: true }).click();
  const file = await downloaded;
  expect(file.suggestedFilename()).toBe('the-river-remembers.canonloom.json');
  await page.reload();
  await page.locator('[data-view="bible"]').click();
  await expect(page.getByRole('heading', { name: 'Nari', exact: true })).toBeVisible();
});

test('every screen fits the viewport and language switching works', async ({ page }) => {
  await page.goto('/');
  for (const view of ['overview', 'bible', 'scenes', 'checks', 'context', 'guide']) {
    await page.locator(`nav [data-view="${view}"]`).click();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
  }
  await page.getByLabel('Language', { exact: true }).selectOption('id');
  await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  await expect(
    page.getByRole('heading', { name: 'Mulai dengan canon kecil yang andal.' }),
  ).toBeVisible();
});

test('invalid imported JSON preserves the active workspace', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await page.getByLabel('Or paste a CanonLoom JSON backup').fill('{broken');
  await page.getByRole('button', { name: 'Load backup', exact: true }).click();
  await expect(page.locator('#form-error')).toContainText('invalid JSON');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('.story-label')).toContainText('The Glass Harbor');
});

test('search finds canon and complete scenes without changing the continuity report', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.locator('nav [data-view="bible"]').click();
  const facts = page.getByRole('searchbox', { name: 'Search names, notes, or facts' });
  await facts.pressSequentially('blue waxed coat');
  await expect(facts).toBeFocused();
  await expect(page.locator('.facts tbody tr')).toHaveCount(1);
  await expect(page.locator('.entity-card h2')).toHaveText('Mira Vale');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(facts).toHaveValue('');
  await page.locator('nav [data-view="scenes"]').click();
  const scenes = page.getByRole('searchbox', { name: 'Search scenes and events' });
  await scenes.fill('despite her fear');
  await expect(page.locator('.scene-panel')).toHaveCount(1);
  await expect(page.locator('.scene-panel .event-row')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await scenes.fill('no matching scene');
  await expect(page.getByText('No matching scenes. Try another search.')).toBeVisible();
  await page.locator('nav [data-view="overview"]').click();
  await page.locator('[data-action="open-scene"][data-id="sealed-archive"]').click();
  await expect(scenes).toHaveValue('');
  await expect(page.locator('.scene-panel')).toHaveCount(2);
  await page.locator('nav [data-view="checks"]').click();
  await expect(page.locator('article.issue')).toHaveCount(3);
  expect(errors).toEqual([]);
});
