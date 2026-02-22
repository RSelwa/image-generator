import { DriveStep } from "driver.js"

export const DRIVER_IDS = {
    LOBBY_PLAYERS: "lobby-players",
    LOBBY_CONFIG: "lobby-config",
    LOBBY_SEED: "lobby-seed",
    JOIN_LOBBY_LINK: "join-lobby-link",
    START_BUTTON_SOLO: "start-button-solo",
    START_BUTTON: "start-button",
    READY_BUTTON: "ready-button",
    SPECIAL_ROUND_MAIN: "special-round-main",
    SPECIAL_ROUND_SELECTION: "special-round-selection",
    SPECIAL_ROUND_X2: "special-round-x2",
    SPECIAL_ROUND_NO_MAP: "special-round-no-map",
} as const


export const STEPS = {
    LOBBY_PLAYERS: { element: `#${DRIVER_IDS.LOBBY_PLAYERS}`, popover: { title: 'Players in lobby', description: 'Here are all the players currently in the lobby', side: "bottom", align: 'center' } },
    LOBBY_CONFIG: { element: `#${DRIVER_IDS.LOBBY_CONFIG}`, popover: { title: 'Lobby configuration', description: 'Here you can see the lobby configuration', side: "bottom", align: 'center' } },
    LOBBY_SEED: { element: `#${DRIVER_IDS.LOBBY_SEED}`, popover: { title: 'Seed', description: 'This is the seed of the game, it will be used to generate the images', side: "bottom", align: 'center' } },
    JOIN_LOBBY_LINK: { element: `#${DRIVER_IDS.JOIN_LOBBY_LINK}`, popover: { title: 'Join lobby link', description: 'Share this link to invite your friends to the lobby', side: "bottom", align: 'center' } },
    START_BUTTON_SOLO: { element: `#${DRIVER_IDS.START_BUTTON_SOLO}`, popover: { title: 'Start game', description: 'Start the game when you are ready', side: "bottom", align: 'center' } },
    START_BUTTON: { element: `#${DRIVER_IDS.START_BUTTON}`, popover: { title: 'Start game', description: 'Start the game when you are ready', side: "bottom", align: 'center' } },
    READY_BUTTON: { element: `#${DRIVER_IDS.READY_BUTTON}`, popover: { title: 'Ready up', description: 'Click this button when you are ready to start the game', side: "bottom", align: 'center' } },
    SPECIAL_ROUND_MAIN: { element: `#${DRIVER_IDS.SPECIAL_ROUND_MAIN}`, popover: { title: 'Special rounds', description: 'This is a special round.', side: "bottom", align: 'center' } },
    SPECIAL_ROUND_SELECTION: { element: `#${DRIVER_IDS.SPECIAL_ROUND_SELECTION}`, popover: { title: 'Special rounds', description: 'During special round, every player will choose between four choices, this will reveal the full image. Other players may choose another image, choose wisely and good luck!', side: "bottom", align: 'center' } },
    SPECIAL_ROUND_X2: { element: `#${DRIVER_IDS.SPECIAL_ROUND_X2}`, popover: { title: 'Special rounds', description: 'During special round, points are doubled.', side: "bottom", align: 'center' } },
    SPECIAL_ROUND_NO_MAP: { element: `#${DRIVER_IDS.SPECIAL_ROUND_NO_MAP}`, popover: { title: 'Special rounds', description: "During special round, you don't need to pin on the map", side: "right", align: 'center' } },
} as const

