import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export interface AccessibilityViolation {
  id: string;
  impact: string | null;
  description: string;
  helpUrl: string;
  nodes: number;
  wcagTags: string[];
}

export interface AccessibilityResult {
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  summary: string;
}

export async function runAccessibilityAudit(
  page: Page,
  options?: {
    tags?: string[]; // WCAG tag filter e.g. ['wcag2a', 'wcag2aa']
    exclude?: string[]; // CSS selectors to exclude from scan
    disableRules?: string[]; // Rule IDs to disable (document reason when using)
  },
): Promise<AccessibilityResult> {
  let builder = new AxeBuilder({ page });

  // Default to WCAG 2.1 Level A and AA
  const tags = options?.tags ?? ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
  builder = builder.withTags(tags);

  if (options?.exclude) {
    builder = builder.exclude(options.exclude);
  }

  if (options?.disableRules) {
    builder = builder.disableRules(options.disableRules);
  }

  const results = await builder.analyze();

  const violations: AccessibilityViolation[] = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? null,
    description: v.description,
    helpUrl: v.helpUrl,
    nodes: v.nodes.length,
    wcagTags: v.tags.filter((t) => t.startsWith('wcag')),
  }));

  const criticalCount = violations.filter((v) => v.impact === 'critical').length;
  const seriousCount = violations.filter((v) => v.impact === 'serious').length;
  const moderateCount = violations.filter((v) => v.impact === 'moderate').length;

  const summary =
    violations.length === 0
      ? 'No accessibility violations found.'
      : `${violations.length} violations found: ${criticalCount} critical, ${seriousCount} serious, ${moderateCount} moderate.`;

  return {
    violations,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    inapplicable: results.inapplicable.length,
    summary,
  };
}

export function assertNoViolations(
  result: AccessibilityResult,
  allowedImpacts: string[] = [],
): void {
  const blocking = result.violations.filter((v) => v.impact && !allowedImpacts.includes(v.impact));

  if (blocking.length === 0) return;

  const details = blocking
    .map(
      (v) =>
        `  • [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n` +
        `    WCAG: ${v.wcagTags.join(', ')} | Nodes affected: ${v.nodes}\n` +
        `    Help: ${v.helpUrl}`,
    )
    .join('\n\n');

  throw new Error(
    `${blocking.length} accessibility violation(s) found:\n\n${details}\n\n${result.summary}`,
  );
}
