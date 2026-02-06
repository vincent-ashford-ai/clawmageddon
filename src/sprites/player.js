// CLAWMAGEDDON - Player Sprite Data
// Anthropomorphic lobster hero with bandana (Earthworm Jim meets Rambo)
// 16x16 pixels at 3x scale = 48x48 display size

// Legend:
// R/r = shell (red), O/o = claw (orange), B/b = bandana (blue)
// Y = eyes (yellow), L/l = legs, W/w = highlights, K = black, _ = transparent

// Idle pose - lobster facing right with big claw
export const PLAYER_IDLE = [
  '______BB________',
  '_____BBBB_______',
  '____BbRRbB______',
  '____RRYYRR______',
  '___RRKYKRR______',
  '___rRRRRRr______',
  '___RRRRRRRR_____',
  '__RRRRrRRRR_____',
  '__RRRr_rRRR_OOO_',
  '__RRR___RRR_OWO_',
  '__rRr___rRr_OOO_',
  '___L_____L__OoO_',
  '___L_____L______',
  '__LL_____LL_____',
  '__Ll_____lL_____',
  '__l_______l_____',
];

// Running frame 1 - left leg forward
export const PLAYER_RUN_1 = [
  '______BB________',
  '_____BBBB_______',
  '____BbRRbB______',
  '____RRYYRR______',
  '___RRKYKRR______',
  '___rRRRRRr______',
  '___RRRRRRRR_____',
  '__RRRRrRRRR_____',
  '__RRRr_rRRR_OOO_',
  '__RRR___RRR_OWO_',
  '__rRr___rRr_OOO_',
  '___LL___L___OoO_',
  '__lL_____L______',
  '__L_______l_____',
  '__l________L____',
  '____________l___',
];

// Running frame 2 - passing
export const PLAYER_RUN_2 = [
  '______BB________',
  '_____BBBB_______',
  '____BbRRbB______',
  '____RRYYRR______',
  '___RRKYKRR______',
  '___rRRRRRr______',
  '___RRRRRRRR_____',
  '__RRRRrRRRR_____',
  '__RRRr_rRRR_OOO_',
  '__RRR___RRR_OWO_',
  '__rRr___rRr_OOO_',
  '___L_____L__OoO_',
  '___LL___LL______',
  '___lL___Ll______',
  '____l___l_______',
  '________________',
];

// Running frame 3 - right leg forward
export const PLAYER_RUN_3 = [
  '______BB________',
  '_____BBBB_______',
  '____BbRRbB______',
  '____RRYYRR______',
  '___RRKYKRR______',
  '___rRRRRRr______',
  '___RRRRRRRR_____',
  '__RRRRrRRRR_____',
  '__RRRr_rRRR_OOO_',
  '__RRR___RRR_OWO_',
  '__rRr___rRr_OOO_',
  '___L___LL___OoO_',
  '___L____lL______',
  '___l______L_____',
  '____L______l____',
  '_____l__________',
];

// Jump pose - legs tucked, claw up
export const PLAYER_JUMP = [
  '____________OOO_',
  '______BB____OWO_',
  '_____BBBB___OOO_',
  '____BbRRbB__OoO_',
  '____RRYYRR______',
  '___RRKYKRR______',
  '___rRRRRRr______',
  '___RRRRRRRR_____',
  '__RRRRrRRRR_____',
  '__RRRr_rRRR_____',
  '__RRR___RRR_____',
  '__rRr___rRr_____',
  '___l_____l______',
  '____L___L_______',
  '_____l_l________',
  '________________',
];

// Run cycle array for animation
export const PLAYER_RUN = [
  PLAYER_RUN_1,
  PLAYER_RUN_2,
  PLAYER_RUN_3,
  PLAYER_RUN_2,
];

// Frame dimensions (pre-scale)
export const PLAYER_FRAME = {
  width: 16,
  height: 16,
  scale: 3,
};
