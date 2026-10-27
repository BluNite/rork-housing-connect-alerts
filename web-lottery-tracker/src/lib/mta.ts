/**
 * Official MTA trunk-line bullet colors (mta.info brand guidelines).
 * These are real-world symbol colors — data, not UI theme tokens.
 * Yellow (N/Q/R/W) and light green (G) bullets get dark text for contrast,
 * matching how the MTA prints them.
 */
const BULLETS: Record<string, { bg: string; fg: string }> = {
  "1": { bg: "#EE352E", fg: "#FFFFFF" },
  "2": { bg: "#EE352E", fg: "#FFFFFF" },
  "3": { bg: "#EE352E", fg: "#FFFFFF" },
  "4": { bg: "#00933C", fg: "#FFFFFF" },
  "5": { bg: "#00933C", fg: "#FFFFFF" },
  "6": { bg: "#00933C", fg: "#FFFFFF" },
  "7": { bg: "#B933AD", fg: "#FFFFFF" },
  A: { bg: "#0039A6", fg: "#FFFFFF" },
  C: { bg: "#0039A6", fg: "#FFFFFF" },
  E: { bg: "#0039A6", fg: "#FFFFFF" },
  B: { bg: "#FF6319", fg: "#FFFFFF" },
  D: { bg: "#FF6319", fg: "#FFFFFF" },
  F: { bg: "#FF6319", fg: "#FFFFFF" },
  M: { bg: "#FF6319", fg: "#FFFFFF" },
  G: { bg: "#6CBE45", fg: "#003B14" },
  J: { bg: "#996633", fg: "#FFFFFF" },
  Z: { bg: "#996633", fg: "#FFFFFF" },
  L: { bg: "#A7A9AC", fg: "#FFFFFF" },
  N: { bg: "#FCCC0A", fg: "#111111" },
  Q: { bg: "#FCCC0A", fg: "#111111" },
  R: { bg: "#FCCC0A", fg: "#111111" },
  W: { bg: "#FCCC0A", fg: "#111111" },
  S: { bg: "#808183", fg: "#FFFFFF" },
  SIR: { bg: "#343C8F", fg: "#FFFFFF" },
  FS: { bg: "#808183", fg: "#FFFFFF" },
  GS: { bg: "#808183", fg: "#FFFFFF" },
  H: { bg: "#808183", fg: "#FFFFFF" },
};

export function trainBullet(train: string): { bg: string; fg: string } {
  return BULLETS[train.trim().toUpperCase()] ?? { bg: "#565656", fg: "#FFFFFF" };
}
