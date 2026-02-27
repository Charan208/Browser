export async function typeText(page, step) {
  await page.fill(step.selector, step.value, { timeout: step.timeoutMs ?? 15000 });
  return { selector: step.selector, typedChars: step.value.length };
}
