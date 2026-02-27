export async function extract(page, step) {
  const value = await page.textContent(step.selector, { timeout: step.timeoutMs ?? 15000 });
  return { selector: step.selector, value: value?.trim() ?? null };
}
