// CLAWMAGEDDON - Enemy Sprite Data
// Alien soldier enemies - 16x16 pixels at 3x scale = 48x48 display

// Legend:
// G/g = grunt (green), P/p = runner (magenta), T/t = tank (steel blue), F/f = flyer (purple)
// E/e = evil eyes (red), K/k = black, W = white, _ = transparent

// ===== GRUNT - Basic alien soldier (neon green) =====
const GRUNT_1 = [
  '______GG________',
  '_____GGGG_______',
  '____GGggGG______',
  '____GEGGEG______',
  '____GgKKgG______',
  '_____GGGG_______',
  '____GGGGGG______',
  '___GGGkkGGG_____',
  '___GgGGGGgG_____',
  '____GGGGGG______',
  '_____GGGG_______',
  '_____GG_GG______',
  '____GG___GG_____',
  '____Gg___gG_____',
  '____g_____g_____',
  '________________',
];

const GRUNT_2 = [
  '______GG________',
  '_____GGGG_______',
  '____GGggGG______',
  '____GEGGEG______',
  '____GgKKgG______',
  '_____GGGG_______',
  '____GGGGGG______',
  '___GGGkkGGG_____',
  '___GgGGGGgG_____',
  '____GGGGGG______',
  '_____GGGG_______',
  '_____GG_GG______',
  '_____GG_GG______',
  '_____Gg_gG______',
  '______g_g_______',
  '________________',
];

// ===== RUNNER - Fast alien (magenta) =====
const RUNNER_1 = [
  '______PP________',
  '_____PPPP_______',
  '____PPppPP______',
  '____PEPPEP______',
  '____PpKKpP______',
  '_____PPPP_______',
  '___PPPPPPPP_____',
  '__PpPPkkPPpP____',
  '___pPPPPPPp_____',
  '____PPPPPP______',
  '_____PP_PP______',
  '____PP___PP_____',
  '___Pp_____pP____',
  '__Pp_______pP___',
  '__p_________p___',
  '________________',
];

const RUNNER_2 = [
  '______PP________',
  '_____PPPP_______',
  '____PPppPP______',
  '____PEPPEP______',
  '____PpKKpP______',
  '_____PPPP_______',
  '___PPPPPPPP_____',
  '__PpPPkkPPpP____',
  '___pPPPPPPp_____',
  '____PPPPPP______',
  '_____PP_PP______',
  '_____PP_PP______',
  '_____Pp_pP______',
  '______p_p_______',
  '________________',
  '________________',
];

// ===== TANK - Heavy armored (steel blue, bulky) =====
const TANK_1 = [
  '___tt____tt_____',
  '___TT____TT_____',
  '_____TTTT_______',
  '____TTTTTT______',
  '___TTTttTTT_____',
  '___TTETTETT_____',
  '___TtKKKKtT_____',
  '____TTTTTT______',
  '___TTTTTTTT_____',
  '__TTTTkkTTTT____',
  '__tTTTTTTTTt____',
  '___TTTTTTTT_____',
  '____TT__TT______',
  '___TT____TT_____',
  '___Tt____tT_____',
  '___t______t_____',
];

const TANK_2 = [
  '___tt____tt_____',
  '___TT____TT_____',
  '_____TTTT_______',
  '____TTTTTT______',
  '___TTTttTTT_____',
  '___TTETTETT_____',
  '___TtKKKKtT_____',
  '____TTTTTT______',
  '___TTTTTTTT_____',
  '__TTTTkkTTTT____',
  '__tTTTTTTTTt____',
  '___TTTTTTTT_____',
  '____TT__TT______',
  '____TT__TT______',
  '____Tt__tT______',
  '_____t__t_______',
];

// ===== FLYER - Winged alien (purple) =====
const FLYER_1 = [
  '__FF______FF____',
  '_FFFF____FFFF___',
  'FFFFF_FF_FFFFF__',
  '_FFF_FFFF_FFF___',
  '____FFffFF______',
  '____FEFFEF______',
  '____FfKKfF______',
  '_____FFFF_______',
  '____FfFFfF______',
  '___FFffffFF_____',
  '___Ff____fF_____',
  '____f____f______',
  '________________',
  '________________',
  '________________',
  '________________',
];

const FLYER_2 = [
  '________________',
  '__FF______FF____',
  '_FFFF____FFFF___',
  '__FFF_FF_FFF____',
  '____FFffFF______',
  '____FEFFEF______',
  '____FfKKfF______',
  '_____FFFF_______',
  '____FfFFfF______',
  '___FFffffFF_____',
  '___Ff____fF_____',
  '____f____f______',
  '________________',
  '________________',
  '________________',
  '________________',
];

// Export all enemy sprites with animation frames
export const ENEMY_SPRITES = {
  GRUNT: {
    frames: [GRUNT_1, GRUNT_2],
  },
  RUNNER: {
    frames: [RUNNER_1, RUNNER_2],
  },
  TANK: {
    frames: [TANK_1, TANK_2],
  },
  FLYER: {
    frames: [FLYER_1, FLYER_2],
  },
};

// Frame dimensions (pre-scale)
export const ENEMY_FRAME = {
  width: 16,
  height: 16,
  scale: 3,
};
