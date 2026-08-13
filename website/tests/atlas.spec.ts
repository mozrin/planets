import { expect, test, type Page } from "@playwright/test";

const researcher = { name: "Atlas Researcher", email: "researcher@example.org" };
const planet = { name: "Kepler-22 b", host_star: "Kepler-22", radius_earth: 2.4, mass_earth: null, orbital_period_days: 289.9, equilibrium_temperature_kelvin: 262, distance_parsecs: 190, discovery_method: "Transit", discovery_year: 2011, semi_major_axis_au: 0.85, star_temperature_kelvin: 5518, star_radius_solar: 0.98, source: "NASA Exoplanet Archive / PSCompPars", synced_at: "2026-01-01T00:00:00.000Z" };

async function mockApi(page: Page) {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/auth/me") return route.fulfill({ json: { user: null } });
    if (url.pathname === "/api/auth/register" || url.pathname === "/api/auth/login") return route.fulfill({ status: 201, json: { user: researcher } });
    if (url.pathname === "/api/auth/logout") return route.fulfill({ json: { ok: true } });
    if (url.pathname === "/api/planets") return route.fulfill({ json: { records: [planet], total: 1, offset: 0, limit: 30, nextOffset: null } });
    return route.fulfill({ status: 404, json: { error: "Not found" } });
  });
}

test("protected navigation requires sign-in, then login opens the Atlas", async ({ page }) => {
  await mockApi(page);
  await page.goto("/atlas/catalogue");
  await expect(page.getByText("Sign in to continue to your requested workspace page.")).toBeVisible();
  await page.getByLabel("Email").fill(researcher.email);
  await page.getByLabel("Password").fill("astronomy");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "A calmer way to navigate other worlds." })).toBeVisible();
});

test("registration, catalogue search, and profile opening complete the core research flow", async ({ page }) => {
  await mockApi(page);
  await page.goto("/join");
  await page.getByLabel("Name").fill(researcher.name);
  await page.getByLabel("Email").fill(researcher.email);
  await page.getByLabel("Password").fill("astronomy");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: /Search the catalogue/ }).click();
  await expect(page.getByText("Kepler-22 b").first()).toBeVisible();
  await page.getByPlaceholder("Search a planet, host star, or discovery method").fill("Kepler-22");
  await page.getByText("Kepler-22 b").first().click();
  await expect(page.getByRole("heading", { name: "Kepler-22 b" })).toBeVisible();
  await expect(page.getByText("RECORD & EVIDENCE")).toBeVisible();
});
