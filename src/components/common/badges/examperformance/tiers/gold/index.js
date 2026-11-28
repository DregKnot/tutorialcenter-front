import snapshot from "./gold.webp";

export const TIER_ID = "gold";
export { snapshot };
export const loadTurntable = () => import(/* webpackChunkName: "medal-gold-spin" */ "./gold-spin.webp");
export const loadHdTurntable = () => Promise.all([
  import(/* webpackChunkName: "medal-gold-spin-hd-1" */ "./gold-spin-hd-1.webp"),
  import(/* webpackChunkName: "medal-gold-spin-hd-2" */ "./gold-spin-hd-2.webp"),
]);
