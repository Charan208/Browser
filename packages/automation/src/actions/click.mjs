export async function click(page, step) {
  await page.click(step.selector, { timeout: step.timeoutMs ?? 15000 });
  return { selector: step.selector };
}
