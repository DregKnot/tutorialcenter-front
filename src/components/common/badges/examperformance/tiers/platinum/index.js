import snapshot from "./platinum.webp";

export const TIER_ID = "platinum";
export { snapshot };
export const loadTurntable = () => import(/* webpackChunkName: "medal-platinum-spin" */ "./platinum-spin.webp");
export const loadHdTurntable = () => Promise.all([
  import(/* webpackChunkName: "medal-platinum-spin-hd-1" */ "./platinum-spin-hd-1.webp"),
  import(/* webpackChunkName: "medal-platinum-spin-hd-2" */ "./platinum-spin-hd-2.webp"),
]);
