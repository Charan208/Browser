export async function navigate(page, step) {
  await page.goto(step.url, { waitUntil: "domcontentloaded", timeout: step.timeoutMs ?? 30000 });
  return { url: step.url };
}
