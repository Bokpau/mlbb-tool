export const runtimeState = {
    apiData: null,
    lastTime: 0,

    posByTime: {},
    nameMap: {},
    campMap: {},
    heroMap: {},

    pollInterval: null,

    player1: null,
    player2: null,

    totalGameTime: 0,

    goldDiffHistory: [],
    goldDiffChart: null,
    teamGoldDiffChart: null,

    selectedPlayer1: null,
    selectedPlayer2: null,

    playerGoldHistory: new Map(),
    teamGoldHistory: new Map(),

    allKillEvents: [],
    allDeathEvents: [],
    allItemEvents: new Map(),

    showItems: true,

    prevItemsMap: new Map(),

    compareCharts: {},

    showDeathsOnMap: true,
    showLiveDataOnMap: true,

    deathReviewData: [],
    deathReviewMode: false,
    selectedDeathIndex: -1,

    showLivePositions: true,
    showLiveData: true,

    currentFilters: {
        team: "all",
        playerId: ""
    },

    draftInterval: null,

    activeTowers: {},

    IMG_CACHE: {},

    playerRankingChart: null,
    rankingIndex: 0,

    mapModalInterval: null,

    animationTime: 0,

    goldDistCharts: {},

    pvpCharts: {},

    DISABLE_TEAM_LOGOS: false,
    TEAM_LOGOS: {}
};