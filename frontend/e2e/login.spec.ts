import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // HTML5 validation will prevent submission
    await expect(page.getByLabel('Email')).toHaveAttribute('required');
    await expect(page.getByLabel('Mot de passe')).toHaveAttribute('required');
  });

  test('should login successfully as investor', async ({ page }) => {
    await page.getByLabel('Email').fill('investor@example.com');
    await page.getByLabel('Mot de passe').fill('Password123!');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should login successfully as admin', async ({ page }) => {
    await page.getByLabel('Email').fill('sesshomaru@admin.com');
    await page.getByLabel('Mot de passe').fill('inyasha');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/admin');
    await expect(page.getByText('Admin Panel')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Mot de passe').fill('wrongpassword');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Should show error toast
    await expect(page.getByText('Erreur de connexion')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByText("S'inscrire").click();
    await expect(page).toHaveURL('/register');
  });
});

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill('investor@example.com');
    await page.getByLabel('Mot de passe').fill('Password123!');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL('/dashboard');
  });

  test('should display portfolio summary', async ({ page }) => {
    await expect(page.getByText('Total investi')).toBeVisible();
    await expect(page.getByText('Valeur actuelle')).toBeVisible();
    await expect(page.getByText('P&L Total')).toBeVisible();
  });

  test('should navigate to pools page', async ({ page }) => {
    await page.getByRole('link', { name: 'Pools' }).click();
    await expect(page).toHaveURL('/pools');
  });

  test('should navigate to investments page', async ({ page }) => {
    await page.getByRole('link', { name: 'Mes investissements' }).click();
    await expect(page).toHaveURL('/investments');
  });

  test('should logout successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Déconnexion' }).click();
    await expect(page).toHaveURL('/login');
  });
});
