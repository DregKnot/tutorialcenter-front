import * as bronze from "./bronze";
import * as silver from "./silver";
import * as gold from "./gold";
import * as platinum from "./platinum";
import * as diamond from "./diamond";

export const TIER_MEDIA = { bronze, silver, gold, platinum, diamond };

export const TURNTABLE_SPEC = {
  frames: 120,
  cols: 12,
  framesPerSheet: 120,
  frameSize: 220,
};

export const HD_TURNTABLE_SPEC = {
  frames: 120,
  cols: 10,
  framesPerSheet: 60,
  frameSize: 400,
};

export function getTierMedia(tier) {
  return TIER_MEDIA[tier] || TIER_MEDIA.gold;
}
