export const SOCIALS_HOOKS = {
  CHALLENGE_EGO_1: "Only real gamers will recognize this game in 3 seconds. ✨",
  CHALLENGE_EGO_2: "If you guess the name before the end, you're a legend. 🏆",
  CHALLENGE_EGO_3: "Bet you can't name this game? 😉",
  CHALLENGE_EGO_4: "Your gaming expertise is being put to the test... 🎮",

  NOSTALGIA_EMOTION_1: "This game defined your personality. Do you remember it? ❤️",
  NOSTALGIA_EMOTION_2: "Nostalgia alert! Who pulled all-nighters playing this? 🌙",
  NOSTALGIA_EMOTION_3: "The atmosphere of this game is unmatched... recognizable anywhere.",
  NOSTALGIA_EMOTION_4: "POV: You just launched your favorite game in your childhood. 💿",

  CURIOSITY_DETAIL_1: "Look closely at the details... Does this world ring a bell? 👀",
  CURIOSITY_DETAIL_2: "What universe are we in? 🔍",
  CURIOSITY_DETAIL_3: "This scenery is stunning, but which game is it from? 🎨",
  CURIOSITY_DETAIL_4: "Can you guess the studio behind this setting? 🏛️",

  ENGAGEMENT_BAIT_1: "Name the game without checking the comments! 🤫",
  ENGAGEMENT_BAIT_2: "Wrong answers only: what game is this? 😂",
  ENGAGEMENT_BAIT_3: "Rate this game out of 10 in the comments! ⭐",
  ENGAGEMENT_BAIT_4: "Tag a friend who grinded this game back in the day! 🏷️"
} as const

export const DEFAULT_SOCIAL_HOOK = SOCIALS_HOOKS.CHALLENGE_EGO_1

export const SOCIALS_NAMES = {
  TIK_TOK: "tiktok",
  INSTAGRAM: "instagram",
} as const

export const SOCIALS_STATUS = {
  ERROR: "error",
  DRAFT: "draft",
  WAITING_JOB_START: "waiting_job_start",
  WAITING_CAPTURE: "waiting_capture",
  IN_PROGRESS_CAPTURE: "in_progress_capture",
  WAITING_AUDIO_EXTRACTION: "waiting_audio_extraction",
  IN_PROGRESS_AUDIO_EXTRACTION: "in_progress_audio_extraction",
  WAITING_CUSTOMIZATION: "waiting_customization",
  IN_PROGRESS_CUSTOMIZATION: "in_progress_customization",
  WAITING_FOR_POST: "waiting_for_post",
  IN_PROGRESS_POSTING: "in_progress_posting",
  READY_TO_POST: "ready_to_post",
  UPLOADED: "uploaded",
} as const

export const SOCIALS_STATUS_WORDING = {
  [SOCIALS_STATUS.ERROR]: "Error",
  [SOCIALS_STATUS.DRAFT]: "Draft",
  [SOCIALS_STATUS.WAITING_CAPTURE]: "Waiting for capture",
  [SOCIALS_STATUS.IN_PROGRESS_CAPTURE]: "Capturing",
  [SOCIALS_STATUS.WAITING_CUSTOMIZATION]: "Waiting for customization",
  [SOCIALS_STATUS.IN_PROGRESS_CUSTOMIZATION]: "Customizing",
  [SOCIALS_STATUS.READY_TO_POST]: "Ready to post",
  [SOCIALS_STATUS.UPLOADED]: "Uploaded",
} as const

export const DEFAULT_DURATION_SECONDS = 15
