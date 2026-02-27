import { click } from "./actions/click.mjs";
import { extract } from "./actions/extract.mjs";
import { navigate } from "./actions/navigate.mjs";
import { screenshot } from "./actions/screenshot.mjs";
import { typeText } from "./actions/type.mjs";

const ACTION_MAP = {
  navigate,
  click,
  type: typeText,
  extract,
  screenshot
};

export async function runStep(page, step) {
  const startedAt = Date.now();
  const handler = ACTION_MAP[step.action];
  if (!handler) {
    throw new Error(`Unsupported action: ${step.action}`);
  }

  const output = await handler(page, step);
  return {
    stepId: step.id,
    status: "success",
    durationMs: Date.now() - startedAt,
    output
  };
}
