/* Local summary suggestions — no external API. The "Improve Summary" button
   rotates through these template phrases, adapting to the user's profession. */

const PROFESSIONAL_OPENERS = [
  'Results-driven',
  'Dedicated',
  'Detail-oriented',
  'Motivated',
  'Accomplished',
  'Passionate',
];

const VALUE_LINES = [
  'with a proven track record of delivering quality outcomes in fast-paced environments.',
  'with strong problem-solving and communication skills honed across diverse roles.',
  'recognised for building trust with customers and collaborating effectively across teams.',
  'committed to continuous improvement, professionalism, and measurable results.',
  'adept at managing multiple priorities while maintaining high service standards.',
  'with a reputation for reliability, accuracy, and meeting tight deadlines.',
];

const GOAL_LINES = [
  'Seeking to contribute my skills and experience to a growing organisation.',
  'Eager to add value to a forward-thinking team while continuing to grow professionally.',
  'Looking to leverage my expertise in a role that offers impact and advancement.',
  'Ready to bring dedication and a strong work ethic to my next opportunity.',
];

export function buildSuggestedSummary(current: string): string {
  const trimmed = current.trim();
  const profession = trimmed.length > 0
    ? trimmed.replace(/\.$/, '')
    : 'professional';

  const opener =
    PROFESSIONAL_OPENERS[Math.floor(Math.random() * PROFESSIONAL_OPENERS.length)];
  const value =
    VALUE_LINES[Math.floor(Math.random() * VALUE_LINES.length)];
  const goal = GOAL_LINES[Math.floor(Math.random() * GOAL_LINES.length)];

  // If the user already wrote something, gently extend rather than replace.
  if (trimmed.length > 0 && trimmed.length < 60) {
    return `${trimmed} ${value} ${goal}`.replace(/\s+/g, ' ');
  }

  return `${opener} ${profession} ${value} ${goal}`.replace(/\s+/g, ' ');
}
