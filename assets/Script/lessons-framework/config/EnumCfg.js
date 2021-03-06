/**
 * 枚举常量
 * by houzehang
 */
module.exports = {
    //-- 事件监听名称
    EEventName: {
        SUCCESS: "SUCCESS",
        FAIL: "FAIL",
        ON_FAIL: "ON_FAIL",
        ON_SUCCESS: "ON_SUCCESS",
        // ============= Touch事件 ============
        ADD_MOVE_NODE: "ADD_TOUCH_NODE",
        ADD_CLICK_NODE: "ADD_CLICK_NODE",
        DELETE_CLICK_NODE: "DELETE_CLICK_NODE",
        DELETE_MOVE_NODE: "DELETE_MOVE_NODE",
        //===============timer计时组件==========
        TIMER_STOP: "TIMER_STOP",
        TIMER_START: "TIMER_START",
        TIMER_PAUSE: "TIMER_PAUSE",
        ON_TIMER_STOP: "ON_TIMER_STOP",
        ON_TIMER_START: "ON_TIMER_START",
        ON_TIMER_PAUSE: "ON_TIMER_PAUSE",
        ON_TIMER_CHANGEPLAYING: "ON_TIMER_CHANGEPLAYING",
        //=====================time2
        TIMER2_STOP: "TIMER2_STOP",
        TIMER2_START: "TIMER2_START",
        TIMER2_PAUSE: "TIMER2_PAUSE",
        TIMER2_SETTIME: "TIMER2_SETTIME",

        ON_TIMER2_TIME_UPDATE: 'ON_TIMER2_TIME_UPDATE',
        //==========swapNodes==========
        ON_SWAPNODES_SHOWCHANGESHOW: "ON_SWAPNODES_SHOWCHANGESHOW",
        // ============= 拖拽相关 =============
        CLICK_DRAG_ALL_ALREADY: "CLICK_DRAG_ALL_ALREADY",
        CLICK_DRAG_UNLOCK_SEAET: "CLICK_DRAG_UNLOCK_SEAET",
        CLICK_DRAG_UPDATE_ALL_POS: "CLICK_DRAG_UPDATE_ALL_POS",
        CLICK_DRAG_SHOW_ALL_DRAG_NODES: "CLICK_DRAG_SHOW_ALL_DRAG_NODES",
        CLICK_DRAG_HIDE_ALL_DRAG_NODES: "CLICK_DRAG_HIDE_ALL_DRAG_NODES",
        CLICK_DRAG_HIDE_DRAG_NODES: "CLICK_DRAG_HIDE_DRAG_NODES",
        ON_CLICK_DRAG_STATE_CHANGE: "ON_CLICK_DRAG_STATE_CHANGE",
        ON_CLICK_DRAG_WRONG: "ON_CLICK_DRAG_WRONG",
        ON_CLICK_DRAG_RIGHT: "ON_CLICK_DRAG_RIGHT",
        ON_CLICK_DRAG_SITDOWN: "ON_CLICK_DRAG_SITDOWN",
        ON_CLICK_DRAG_PROGRESS: "ON_CLICK_DRAG_PROGRESS",
        CLICK_DRAG_RESET_CLICK_DRAG: "CLICK_DRAG_RESET_CLICK_DRAG",
        ON_CLICK_DRAG_START: "ON_CLICK_DRAG_START",

        ////======== 点击出现相关 ========
        CLICK_APPEAR_ALL_ALREADY: "CLICK_APPEAR_ALL_ALREADY",
        CLICK_APPEAR_RESET: "CLICK_APPEAR_RESET",
        ON_CLICK_APPEAR_SHOW_WITH_INDEX: "ON_CLICK_APPEAR_SHOW_WITH_INDEX",
        ON_CLICK_APPEAR_SHOW_ALL: "ON_CLICK_APPEAR_SHOW_ALL",
        ON_CLICK_SHOW_HIDE_NODE_SET_ENABLE: "ON_CLICK_SHOW_HIDE_NODE_SET_ENABLE",

        ////======== 点击次数相关 ========
        CLICK_TIMES_SET_CLICK_COUNT_ENABLED: "CLICK_TIMES_SET_CLICK_COUNT_ENABLED",
        CLICK_TIMES_RESET: "CLICK_TIMES_RESET",
        CLICK_TIMES_REJECT: "CLICK_TIMES_REJECT",
        ON_CLICK: "ON_CLICK",
        ON_CLICK_TIMES_UP_TO: "ON_CLICK_TIMES_UP_TO",

        ////======== 上下文相关 ========
        CONTEXT_PLAY_FIRECRACKER: "CONTEXT_PLAY_FIRECRACKER",
        CONTEXT_STOP_ONCE: "CONTEXT_STOP_ONCE",
        CONTEXT_ENABLE_MAGIC: "CONTEXT_ENABLE_MAGIC",
        CONTEXT_UPDATE_PROGRESS: "CONTEXT_UPDATE_PROGRESS",
        CONTEXT_PLAY_AUDIO: "CONTEXT_PLAY_AUDIO",
        CONTEXT_STOP_AUDIO: "CONTEXT_STOP_AUDIO",
        CONTEXT_SEND_SMS: "CONTEXT_SEND_SMS",
        CONTEXT_DREAM_START: "CONTEXT_DREAM_START",
        CONTEXT_DREAM_END: "CONTEXT_DREAM_END",
        CONTEXT_PICK_STAR: "CONTEXT_PICK_STAR",
        CONTEXT_SETNETDATA: "CONTEXT_SETNETDATA",
        CONTEXT_GETNETDATA: "CONTEXT_GETNETDATA",
        CONTEXT_SETNETDATA_OF_STUDENT: "CONTEXT_SETNETDATA_OF_STUDENT",
        CONTEXT_GETNETDATA_OF_STUDENT: "CONTEXT_GETNETDATA_OF_STUDENT",

        CONTEXT_ISPREVIEWPASSED: "CONTEXT_ISPREVIEWPASSED",
        CONTEXT_SETPREVIEWPASSED: "CONTEXT_SETPREVIEWPASSED",
        CONTEXT_PLAYNEXTPAGE: "CONTEXT_PLAYNEXTPAGE",
        CONTEXT_PLAYPREVPAGE: "CONTEXT_PLAYPREVPAGE",


        ON_CONTEXT_MOUNTED: "ON_CONTEXT_MOUNTED",
        ON_CONTEXT_MAGIC_ENABLED_CHANGE: "ON_CONTEXT_MAGIC_ENABLED_CHANGE",
        ON_CONTEXT_KEY_DOWN: "ON_CONTEXT_KEY_DOWN",
        ON_CONTEXT_KEY_UP: "ON_CONTEXT_KEY_UP",
        ON_CONTEXT_DANCE_CHANGE: "ON_CONTEXT_DANCE_CHANGE",
        ON_CONTEXT_MOUSE_MOVE: "ON_CONTEXT_MOUSE_MOVE",
        ON_CONTEXT_USERUPDATE: "ON_CONTEXT_USERUPDATE",

        // 斯巴达
        ON_CONTEXT_INITED: "ON_CONTEXT_INITED",
        ON_CONTEXT_LOADED: "ON_CONTEXT_LOADED",
        ON_CONTEXT_PUT_DANCE: "ON_CONTEXT_PUT_DANCE",
        ON_CONTEXT_SEEK_MASTER_BRANCH: "ON_CONTEXT_SEEK_MASTER_BRANCH",
        ON_CONTEXT_SEEK_ACTOR_BRANCH: "ON_CONTEXT_SEEK_ACTOR_BRANCH",
        ON_CONTEXT_BACK_DANCE: "ON_CONTEXT_BACK_DANCE",
        ON_CONTEXT_START_AUDIORECORD: "ON_CONTEXT_START_AUDIORECORD",
        ON_CONTEXT_STOP_AUDIORECORD: "ON_CONTEXT_STOP_AUDIORECORD",
        ON_CONTEXT_SHOW_LOTTERY: "ON_CONTEXT_SHOW_LOTTERY",
        ON_CONTEXT_HIDE_LOTTERY: "ON_CONTEXT_HIDE_LOTTERY",
        ON_CONTEXT_SHOW_RESPONDER: "ON_CONTEXT_SHOW_RESPONDER",
        ON_CONTEXT_HIDE_RESPONDER: "ON_CONTEXT_HIDE_RESPONDER",
        ON_CONTEXT_ADD_STAR: "ON_CONTEXT_ADD_STAR",
        ON_CONTEXT_FULL_SCREEN: "ON_CONTEXT_FULL_SCREEN",
        ON_CONTEXT_FEED_BACK_PK_RESULT: "ON_CONTEXT_FEED_BACK_PK_RESULT",
        ON_CONTEXT_SWITCH_MASTER_BRANCH: "ON_CONTEXT_SWITCH_MASTER_BRANCH",
        ON_CONTEXT_NEXT_PAGE: "ON_CONTEXT_NEXT_PAGE",
        ON_CONTEXT_SWITCH_ACTOR_BRANCH: "ON_CONTEXT_SWITCH_ACTOR_BRANCH",
        ON_CONTEXT_ADD_STAR_TO_ACTOR: "ON_CONTEXT_ADD_STAR_TO_ACTOR",
        ON_CONTEXT_START_AUDIO_RECORD_WITH_TIME: "ON_CONTEXT_START_AUDIO_RECORD_WITH_TIME",
        ON_CONTEXT_COURSE_FINISHED: "ON_CONTEXT_COURSE_FINISHED",
        ON_CONTEXT_MUTE_VIDEO: "ON_CONTEXT_MUTE_VIDEO",


        ////======== 字幕相关 ========
        SUBTITLE_CONTROLLER_PLAY: "SUBTITLE_CONTROLLER_PLAY",
        SUBTITLE_CONTROLLER_PAUSE: "SUBTITLE_CONTROLLER_PAUSE",
        SUBTITLE_CONTROLLER_GOON: "SUBTITLE_CONTROLLER_GOON",
        SUBTITLE_CONTROLLER_HIDE: "SUBTITLE_CONTROLLER_HIDE",
        ON_SUBTITLE_CONTROLLER_START_WITH_INDEX: "ON_SUBTITLE_CONTROLLER_START_WITH_INDEX",

        ////======== 悬浮字幕相关 ========
        CAPTION_CONTROLLER_SHOW_WITH_INDEX: "CAPTION_CONTROLLER_SHOW_WITH_INDEX",
        CAPTION_CONTROLLER_SHOW_NEXT: "CAPTION_CONTROLLER_SHOW_NEXT",
        CAPTION_CONTROLLER_HIDE_WITH_INDEX: "CAPTION_CONTROLLER_HIDE_WITH_INDEX",

        ////======== 配图相关 ========
        AUX_PIC_CONTROLLER_SHOW_WITH_INDEX: "AUX_PIC_CONTROLLER_SHOW_WITH_INDEX",
        AUX_PIC_CONTROLLER_SHOW_NEXT: "AUX_PIC_CONTROLLER_SHOW_NEXT",
        AUX_PIC_CONTROLLER_HIDE_WITH_INDEX: "AUX_PIC_CONTROLLER_HIDE_WITH_INDEX",

        ////======== 关键字相关 ========
        KEYWORD_CONTROLLER_SHOW_WITH_INDEX: "KEYWORD_CONTROLLER_SHOW_WITH_INDEX",
        KEYWORD_CONTROLLER_SHOW_NEXT: "KEYWORD_CONTROLLER_SHOW_NEXT",
        KEYWORD_CONTROLLER_HIDE_WITH_INDEX: "KEYWORD_CONTROLLER_HIDE_WITH_INDEX",
        KEYWORD_CONTROLLER_HIDE_CUR: "KEYWORD_CONTROLLER_HIDE_CUR",

        ////======== 文稿相关 ========
        ARTICLE_CONTROLLER_PLAY: "ARTICLE_CONTROLLER_PLAY",
        ARTICLE_CONTROLLER_PAUSE: "ARTICLE_CONTROLLER_PAUSE",
        ARTICLE_CONTROLLER_GOON: "ARTICLE_CONTROLLER_GOON",
        ARTICLE_CONTROLLER_UPDATE_TIMELEN: "ARTICLE_CONTROLLER_UPDATE_TIMELEN",
        ARTICLE_CONTROLLER_RESET: "ARTICLE_CONTROLLER_RESET",
        ARTICLE_CONTROLLER_SET_TIME_SCALE: "ARTICLE_CONTROLLER_SET_TIME_SCALE",
        ON_ARTICLE_CONTROLLER_COMPLETE: "ON_ARTICLE_CONTROLLER_COMPLETE",

        ////======== 动画相关 ========
        ANIM_CONTROLLER_PLAY: "ANIM_CONTROLLER_PLAY",
        ANIM_CONTROLLER_PAUSE: "ANIM_CONTROLLER_PAUSE",
        ANIM_CONTROLLER_RESUME: "ANIM_CONTROLLER_RESUME",
        ANIM_CONTROLLER_REPLAY_CUR: "ANIM_CONTROLLER_REPLAY_CUR",
        ANIM_CONTROLLER_REPLAY_ALL: "ANIM_CONTROLLER_REPLAY_ALL",
        ANIM_CONTROLLER_NEXT_ONE: "ANIM_CONTROLLER_NEXT_ONE",
        ANIM_CONTROLLER_NEXT_GROUP: "ANIM_CONTROLLER_NEXT_GROUP",
        ON_ANIM_CONTROLLER_START: "ON_ANIM_CONTROLLER_START",
        ON_ANIM_CONTROLLER_COMPLETE: "ON_ANIM_CONTROLLER_COMPLETE",
        ON_ANIM_CONTROLLER_EVENT: "ON_ANIM_CONTROLLER_EVENT",

        ////======== 音频相关 ========
        AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE: "AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE",
        AUDIO_CONTROLLER_PLAY_STOP: "AUDIO_CONTROLLER_PLAY_STOP",
        ON_AUDIO_CONTROLLER_START_SUBTITLE: "ON_AUDIO_CONTROLLER_START_SUBTITLE",
        ON_AUDIO_CONTROLLER_COMPLETE_SUBTITLE: "ON_AUDIO_CONTROLLER_COMPLETE_SUBTITLE",
        ON_AUDIO_CONTROLLER_START_CUSTOM: "ON_AUDIO_CONTROLLER_START_CUSTOM",
        ON_AUDIO_CONTROLLER_COMPLETE_CUSTOM: "ON_AUDIO_CONTROLLER_COMPLETE_CUSTOM",

        ////======== 舞台相关 ========
        STAGE_CONTROLLER_SWITCH_STAGE_TO: "STAGE_CONTROLLER_SWITCH_STAGE_TO",
        STAGE_CONTROLLER_GOBACK: "STAGE_CONTROLLER_GOBACK",
        STAGE_CONTROLLER_NEXT: "STAGE_CONTROLLER_NEXT",
        ON_STAGE_CONTROLLER_SWITCH_TO: "ON_STAGE_CONTROLLER_SWITCH_TO",

        ////======== 射击气球 =======
        SHOOTDARTS_ALL_ALREADY: "SHOOTDARTS_ALL_ALREADY",
        ON_SHOOTDARTS_RIGHT: "ON_SHOOTDARTS_RIGHT",

        ////======== bmLabel =======
        LABEL_CONTROLLER_SET_STRING: "LABEL_CONTROLLER_SET_STRING",
        //pair
        PAIR_TOUCH_ENABLE: "PAIR_TOUCH_ENABLE",
        ON_PAIR_SELET_RIGHT_INDEX: "ON_PAIR_SELET_RIGHT_INDEX",
        ON_PAIR_SELET: "ON_PAIR_SELET",

        CHANGE_USERNAME: "CHANGE_USERNAME",
        CHANGE_ACTORNAME: "CHANGE_ACTORNAME",

        BEGIN_COURSE: "BEGIN_COURSE",

        //PAGE_CONTROLLER_SET_PAGE
        PAGE_CONTROLLER_SET_PAGE: "PAGE_CONTROLLER_SET_PAGE"
    },

    //-- 点击拖拽物品的当前状态
    ERoleState: cc.Enum({
        //-- 拖拽物还没有被放置到争取的位置
        STANDALONE: 0,
        //-- 拖拽物已经被放置到争取的位置
        SITDOWN: 1
    }),

    //-- 点击拖拽后的行为
    ESitDownStyle: cc.Enum({
        //-- 拖拽成功后落在位置上
        SITDOWN: 0,
        //-- 拖拽成功后隐藏掉
        HIDE: 1,
        //-- "拖拽"成功静止不动(针对无需拖拽的情况，点击即OK)
        STATIC: 2,
        //-- 拖拽成功后又返回原位置
        BACK: 3,
        //-- 从上方飞入
        FLY_INTO_FROM_TOP: 4,
        //-- 无效果
        NONE: 5,
    }),

    //-- 点击出现的方式
    EAppaerStyle: cc.Enum({
        //-- 按顺序出现
        INORDER: 0,
    }),

    //-- 点击出现的节点类型
    ENodeType: cc.Enum({
        //-- 节点非动画
        STATIC: 0,
        //-- 节点为动画
        ANIM: 1
    }),

    //-- 音频类型
    EAudioType: cc.Enum({
        NONE: 0,
        //-- 背景音乐
        BGM: 1,
        //-- 魔法棒
        MAGIC: 2,
        //-- 点击
        CLICK: 3,
        //-- 正确
        RIGHT: 4,
        //-- 错误
        WRONG: 5,
        //-- 旁白/提示/阅读段落等等
        CUSTOM: 6,
        //-- 单行字幕读音
        SUBTITLE: 7
    }),

    //-- 拖拽计算进度的标准
    ECalcProgressStyle: cc.Enum({
        NONE: 0,
        //-- 以当前非空位置个数为准
        SEAT_BASE: 1,
        //-- 以当前入座的角色个数为准
        ROLE_BASE: 2
    }),

    //-- 滚动字幕对齐方式
    EETextAlignStyle: cc.Enum({
        //-- 左对齐
        LEFT: 0,
        //-- 居中对齐
        CENTER: 1,
        //-- 右对齐
        RIGHT: 2
    }),

    ESprataDanceStyle: cc.Enum({
        TYPE_MAJOR: "master-major",
        TYPE_MINOR: "master-minor",
        TYPE_SELF: "self",
        TYPE_ACTOR: "actor",
    }),
    E_sprata_Module_Type: cc.Enum({
        t_reading_cinema: 1,
        t_spelling_park: 2,
        t_gaming_center: 3,
        t_self_introduce: 4,
        t_summary: 5,

        t_preview: 30,
        t_review_table: 31,
        t_review_spell: 32,
        t_review_game: 33,
        t_review_write: 34,
    }),
    E_sprata_mutual_Type: cc.Enum({
        t_put_dance: 1,
        t_audio_record: 2,
        t_play_game: 3,
        t_collect_card: 4,
        t_write: 5,
    }),
    E_COURSE_TYPE: cc.Enum({
        PREVIEW: 'PREVIEW',
        COURSE: 'COURSE',
        REVIEW: 'REVIEW',
        HOMEWORK: 'HOMEWORK'
    }),

    //-- 綁定按鍵
    EWatchingKeys: cc.Enum((function (Obj) {
        let result = {},
            cache = {};
        for (let key in Obj) {
            if (cache[Obj[key]] == undefined) {
                cache[Obj[key]] = !0;
                result[('key_' + key).toUpperCase()] = Obj[key];
            }
        }
        return result;
    })(cc.KEY))
}