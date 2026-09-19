export const RESERVED_SLUGS = [
  "api",
  "login",
  "register",
  "dashboard",
  "admin",
  "r",
  "bio",
  "auth",
  "health",
  "settings",
  "profile",
  "links",
  "analytics",
  "www",
  "mail",
  "support",
];

export const isReservedSlug = (slug) => RESERVED_SLUGS.includes(slug.toLowerCase());
