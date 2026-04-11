import { test, expect } from '@playwright/test';

test.describe('Setter Terminal Flow', () => {
  test('should render the login screen', async ({ page }) => {
    // Navigate to the root, which should redirect or show login since we are unauthenticated
    await page.goto('/');

    // Check if the UnifiedLogin component renders
    await expect(page.locator('text=Command Environment')).toBeVisible({ timeout: 10000 });
  });
  
  test('should load the auth join page for onboardings', async ({ page }) => {
    await page.goto('/join');
    // Check if the title text exists
    await expect(page.locator('text=Invitation Validation Strategy')).toBeVisible({ timeout: 10000 });
  });
});
