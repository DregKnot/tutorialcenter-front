import snapshot from "./diamond.webp";
import pulse from "./diamond-pulse.webp";

export const TIER_ID = "diamond";
export { snapshot, pulse };
export const loadTurntable = () => import(/* webpackChunkName: "medal-diamond-spin" */ "./diamond-spin.webp");
export const loadHdTurntable = () => Promise.all([
  import(/* webpackChunkName: "medal-diamond-spin-hd-1" */ "./diamond-spin-hd-1.webp"),
  import(/* webpackChunkName: "medal-diamond-spin-hd-2" */ "./diamond-spin-hd-2.webp"),
]);
