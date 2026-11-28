import snapshot from "./silver.webp";

export const TIER_ID = "silver";
export { snapshot };
export const loadTurntable = () => import(/* webpackChunkName: "medal-silver-spin" */ "./silver-spin.webp");
export const loadHdTurntable = () => Promise.all([
  import(/* webpackChunkName: "medal-silver-spin-hd-1" */ "./silver-spin-hd-1.webp"),
  import(/* webpackChunkName: "medal-silver-spin-hd-2" */ "./silver-spin-hd-2.webp"),
]);
