export async function screenshot(page, step) {
  const path = step.path ?? `artifacts/${Date.now()}-${step.id}.png`;
  await page.screenshot({ path, fullPage: Boolean(step.fullPage) });
  return { path };
}
