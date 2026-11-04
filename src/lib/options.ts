/** Static option lists shared by the admin forms (safe to import on the client). */
export const ICON_OPTIONS = [
  "code", "server", "database", "layers", "rocket", "palette", "sparkles", "globe", "shield", "zap", "git",
  "cloud", "terminal", "smartphone", "cpu", "search", "pen", "chart", "wrench", "brain", "box",
].map((v) => ({ value: v, label: v }));

export const PLATFORM_OPTIONS = ["github", "linkedin", "x", "youtube", "instagram", "email", "website"].map((v) => ({
  value: v,
  label: v,
}));
