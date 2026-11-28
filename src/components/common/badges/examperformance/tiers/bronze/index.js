import snapshot from "./bronze.webp";

export const TIER_ID = "bronze";
export { snapshot };
export const loadTurntable = () => import(/* webpackChunkName: "medal-bronze-spin" */ "./bronze-spin.webp");
export const loadHdTurntable = () => Promise.all([
  import(/* webpackChunkName: "medal-bronze-spin-hd-1" */ "./bronze-spin-hd-1.webp"),
  import(/* webpackChunkName: "medal-bronze-spin-hd-2" */ "./bronze-spin-hd-2.webp"),
]);
