/**
 * 课件逻辑基类
 * by houzehang
 */
let NoticeCenter = require('./../core/NoticeCenter');
let EnumCfg = require('./../config/EnumCfg');

module.exports = cc.Class({
    extends: cc.Component,

    properties: {
        //-- 事件容器
        _eventHash: [],
        //-- 定时器ID记录容器
        _timerIdArrForTimeout: [],
        _timerIdArrForInterval: [],
    },

    onLoad() {
        this.registerEvents();
        this._bindInterfaces();
    },

    /**
     * 对各组件操控的接口函数
     * 找不到自己需要使用的方法时，自行添加并提交（注意归类）
     * @return {[type]} [description]
     */
    _bindInterfaces() {
        //TIMER 计时器
        this.startTimer = function () {
            this.notice(EnumCfg.EEventName.TIMER_START, ...arguments)
        }
        this.stopTimer = function () {
            this.notice(EnumCfg.EEventName.TIMER_STOP, ...arguments)
        }
        this.pauseTimer = function () {
            this.notice(EnumCfg.EEventName.TIMER_PAUSE, ...arguments)
        }
        this.startTimer2 = function () {
            this.notice(EnumCfg.EEventName.TIMER2_START, ...arguments)
        }
        this.stopTimer2 = function () {
            this.notice(EnumCfg.EEventName.TIMER2_STOP, ...arguments)
        }
        this.pauseTimer2 = function () {
            this.notice(EnumCfg.EEventName.TIMER2_PAUSE, ...arguments)
        }
        this.setTime2 = function () {
            this.notice(EnumCfg.EEventName.TIMER2_SETTIME, ...arguments)
        }
        //-- 插图字幕（需要挂载组件【CaptionController】）
        this.showCaption = function () {
            this.notice(EnumCfg.EEventName.CAPTION_CONTROLLER_SHOW_WITH_INDEX, ...arguments);
        };
        this.nextCaption = function () {
            this.notice(EnumCfg.EEventName.CAPTION_CONTROLLER_SHOW_NEXT, ...arguments);
        };
        this.hideCaption = function () {
            this.notice(EnumCfg.EEventName.CAPTION_CONTROLLER_HIDE_WITH_INDEX, ...arguments);
        };

        //-- 关键字控制器（需要挂载组件【KeywordController】）
        this.showKeyWord = function () {
            this.notice(EnumCfg.EEventName.KEYWORD_CONTROLLER_SHOW_WITH_INDEX, ...arguments);
        };

        //-- 纵向滚动字幕（需要挂载组件【ArticleController】）
        this.playArticle = function () {
            this.notice(EnumCfg.EEventName.ARTICLE_CONTROLLER_PLAY, ...arguments);
        };
        this.resetArticle = function () {
            this.notice(EnumCfg.EEventName.ARTICLE_CONTROLLER_RESET, ...arguments);
        };
        this.pauseArticle = function () {
            this.notice(EnumCfg.EEventName.ARTICLE_CONTROLLER_PAUSE, ...arguments);
        };
        this.scaleArticle = function () {
            this.notice(EnumCfg.EEventName.ARTICLE_CONTROLLER_SET_TIME_SCALE, ...arguments);
        };
        this.updateArticleTimeLength = function () {
            this.notice(EnumCfg.EEventName.ARTICLE_CONTROLLER_UPDATE_TIMELEN, ...arguments)
        }
        //-- 底部单句字幕（需要挂载组件【SubtitleController】）
        this.playSubtitle = function () {
            this.notice(EnumCfg.EEventName.SUBTITLE_CONTROLLER_PLAY, ...arguments);
        };

        //-- 关键字（需要挂载组件【KeywordController】）
        this.showKeyword = function () {
            this.notice(EnumCfg.EEventName.KEYWORD_CONTROLLER_SHOW_WITH_INDEX, ...arguments);
        };
        this.hideKeyword = function () {
            this.notice(EnumCfg.EEventName.KEYWORD_CONTROLLER_HIDE_WITH_INDEX, ...arguments);
        };

        //-- 普通配图（需要挂载组件【AuxPicController】）
        this.showAuxpic = function () {
            this.notice(EnumCfg.EEventName.AUX_PIC_CONTROLLER_SHOW_WITH_INDEX, ...arguments);
        };
        this.hideAuxpic = function () {
            this.notice(EnumCfg.EEventName.AUX_PIC_CONTROLLER_HIDE_WITH_INDEX, ...arguments);
        };

        //-- 声音相关（需要挂载组件【AudioController】）
        this.playAudioCustom = function () {
            this.notice(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.CUSTOM, ...arguments);
        };
        this.playAudioClick = function () {
            this.notice(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.CLICK, ...arguments);
        };
        this.playAudioRight = function () {
            this.notice(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.RIGHT, ...arguments);
        };
        this.playAudioWrong = function () {
            this.notice(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.WRONG, ...arguments);
        };
        this.playAudioBg = function () {
            this.notice(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.BGM, ...arguments);
        };
        this.playAudioSubtitle = function () {
            this.notice(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.SUBTITLE, ...arguments);
        };
        this.hideSubtitleFont = function () {
            this.notice(EnumCfg.EEventName.SUBTITLE_CONTROLLER_HIDE, ...arguments)
        }
        this.stopAllAudio = function () {
            this.notice(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_STOP, ...arguments);
        };

        //-- 有效点击次数相关（需要挂载组件【ClikTimes】）
        this.stopClickCounter = function (compId = 0, target = null) {
            this.notice(EnumCfg.EEventName.CLICK_TIMES_SET_CLICK_COUNT_ENABLED, compId, target, false);
        };
        this.startClickCounter = function (compId = 0, target = null) {
            this.notice(EnumCfg.EEventName.CLICK_TIMES_SET_CLICK_COUNT_ENABLED, compId, target, true);
        };
        this.resetClickCounter = function () {
            this.notice(EnumCfg.EEventName.CLICK_TIMES_RESET, ...arguments);
        };
        this.rejectClickTimes = function () {
            this.notice(EnumCfg.EEventName.CLICK_TIMES_REJECT, ...arguments);
        };
        //-- 动画相关（需要挂载组件【AnimController】）
        this.playAnim = function () {
            this.notice(EnumCfg.EEventName.ANIM_CONTROLLER_PLAY, ...arguments);
        };
        this.pauseAnim = function () {
            this.notice(EnumCfg.EEventName.ANIM_CONTROLLER_PAUSE, ...arguments);
        };
        this.resumeAnim = function () {
            this.notice(EnumCfg.EEventName.ANIM_CONTROLLER_RESUME, ...arguments);
        };

        //-- context相关（需要挂载组件【ContextTransfer】）
        this.updateProgress = function (progressVal) {
            this.notice(EnumCfg.EEventName.CONTEXT_UPDATE_PROGRESS, progressVal);
        }
        this.sendSMS = function (smsData) {
            this.notice(EnumCfg.EEventName.CONTEXT_SEND_SMS, smsData);
        }
        this.startDream = function () {
            this.notice(EnumCfg.EEventName.CONTEXT_DREAM_START);
        }
        this.endDream = function () {
            this.notice(EnumCfg.EEventName.CONTEXT_DREAM_END);
        }
        this.pickStar = function (num) {
            this.notice(EnumCfg.EEventName.CONTEXT_PICK_STAR, ...arguments)
        }
        this.setNetData = function (value) {
            this.notice(EnumCfg.EEventName.CONTEXT_SETNETDATA, ...arguments)
        }
        this.getNetData = function (value) {
            this.notice(EnumCfg.EEventName.CONTEXT_GETNETDATA, ...arguments)
        }
        this.setNetDataOfStudent = function (value) {
            this.notice(EnumCfg.EEventName.CONTEXT_SETNETDATA_OF_STUDENT, ...arguments)
        }
        this.getNetDataOfStudent = function (value) {
            this.notice(EnumCfg.EEventName.CONTEXT_GETNETDATA_OF_STUDENT, ...arguments)
        }
        this.stopOnce = function (value) {
            this.notice(EnumCfg.EEventName.CONTEXT_STOP_ONCE, ...arguments)
        }
        this.setMagicEnabled = function () {
            this.notice(EnumCfg.EEventName.CONTEXT_ENABLE_MAGIC, ...arguments)
        }
        //预习
        this.isPreviewPassed = function () {
            this.notice(EnumCfg.EEventName.CONTEXT_ISPREVIEWPASSED, ...arguments)
        }
        this.setPreViewPassed = function () {
            this.notice(EnumCfg.EEventName.CONTEXT_SETPREVIEWPASSED, ...arguments)
        }
        this.playNextPage = function () {
            this.notice(EnumCfg.EEventName.CONTEXT_PLAYNEXTPAGE, ...arguments)
        }
        this.playPrevPage = function () {
            this.notice(EnumCfg.EEventName.CONTEXT_PLAYPREVPAGE, ...arguments)
        }

        //-- 舞台相关（需要挂载组件【StageController】）
        this.switchStageTo = function () {
            this.notice(EnumCfg.EEventName.STAGE_CONTROLLER_SWITCH_STAGE_TO, ...arguments);
        }
        this.nextStage = function () {
            this.notice(EnumCfg.EEventName.STAGE_CONTROLLER_NEXT, ...arguments);
        }

        //-- 点击出现相关（需要挂载组件【ClickAppear】）
        this.startClickAppear = function (compId = 0) {
            this.notice(EnumCfg.EEventName.CLICK_APPEAR_ALL_ALREADY, compId, true);
        }
        this.stopClickAppear = function (compId = 0) {
            this.notice(EnumCfg.EEventName.CLICK_APPEAR_ALL_ALREADY, compId, false);
        }
        this.resetClickAppear = function (compId = 0) {
            this.notice(EnumCfg.EEventName.CLICK_APPEAR_RESET, ...arguments);
        }

        //-- 点击拖拽相关（需要挂载组件【ClickDrag】）
        this.hideClickDragNodes = function () {
            this.notice(EnumCfg.EEventName.CLICK_DRAG_HIDE_DRAG_NODES, ...arguments);
        }
        this.showAllClickDragNodes = function () {
            this.notice(EnumCfg.EEventName.CLICK_DRAG_SHOW_ALL_DRAG_NODES, ...arguments);
        }
        this.startClickDrag = function (compId = 0) {
            this.notice(EnumCfg.EEventName.CLICK_DRAG_ALL_ALREADY, compId, true);
        }
        this.stopClickDrag = function (compId = 0) {
            this.notice(EnumCfg.EEventName.CLICK_DRAG_ALL_ALREADY, compId, false);
        }
        this.updateClickDragPos = function () {
            this.notice(EnumCfg.EEventName.CLICK_DRAG_UPDATE_ALL_POS, ...arguments);
        }
        this.resetClickDrag = function (compId = 0) {
            this.notice(EnumCfg.EEventName.CLICK_DRAG_RESET_CLICK_DRAG, ...arguments);
        }
        //--  射击气球相关
        this.startShootDarts = function () {
            this.notice(EnumCfg.EEventName.SHOOTDARTS_ALL_ALREADY, true);
        }
        //-- 自定义label相关
        this.setString = function () {
            this.notice(EnumCfg.EEventName.LABEL_CONTROLLER_SET_STRING, ...arguments);
        }
        this.pairSetTouchEnable = function () {
            this.notice(EnumCfg.EEventName.PAIR_TOUCH_ENABLE, ...arguments);
        }

        // sprata
        this.sprata_putDance = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_PUT_DANCE, ...arguments);
        };
        this.sprata_seekMasterProgress = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_SEEK_MASTER_BRANCH, ...arguments);
        };
        this.sprata_seekActorProgress = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_SEEK_ACTOR_BRANCH, ...arguments);
        };
        this.sprata_backDance = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_BACK_DANCE, ...arguments);
        };
        this.sprata_startAudioRecord = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_START_AUDIORECORD, ...arguments);
        };
        this.sprata_stopAudioRecord = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_STOP_AUDIORECORD, ...arguments);
        };
        this.sprata_showLottery = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_SHOW_LOTTERY, ...arguments);
        };
        this.sprata_hideLottery = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_HIDE_LOTTERY);
        };
        this.sprata_showResponder = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_SHOW_RESPONDER, ...arguments);
        };
        this.sprata_hideResponder = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_HIDE_RESPONDER);
        };
        this.sprata_addStar = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_ADD_STAR, ...arguments);
        };
        this.sprata_fullScreen = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_FULL_SCREEN, ...arguments);
        };
        this.sprata_feedBackPKResult = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_FEED_BACK_PK_RESULT, ...arguments);
        };
        this.sprata_switchMasterBranch = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_SWITCH_MASTER_BRANCH, ...arguments);
        };
        this.sprata_nextPage = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_NEXT_PAGE, ...arguments);
        };
        this.sprata_switchActorBranch = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_SWITCH_ACTOR_BRANCH, ...arguments);
        };
        this.sprata_addStarToActor = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_ADD_STAR_TO_ACTOR, ...arguments);
        };
        this.sprata_startAuidoRecordWithTime = function () {
            console.log('MINGXI_DEBUG_LOG>>>>>>>>>sprata_startAuidoRecordWithTime in logic base', '');
            this.notice(EnumCfg.EEventName.ON_CONTEXT_START_AUDIO_RECORD_WITH_TIME, ...arguments);
        };
        this.sprata_courseFinished = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_COURSE_FINISHED);
        };
        this.sprata_muteVideo = function () {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_MUTE_VIDEO, ...arguments);
        };
        this.sprata_changeUsername = function () {
            this.notice(EnumCfg.EEventName.CHANGE_USERNAME, ...arguments);
        };
        this.sprata_changeActorname = function () {
            this.notice(EnumCfg.EEventName.CHANGE_ACTORNAME, ...arguments);
        };
        this.sprata_beginCourse = function () {
            this.notice(EnumCfg.EEventName.BEGIN_COURSE)
        };
        this.setPage = function () {
            this.notice(EnumCfg.EEventName.PAGE_CONTROLLER_SET_PAGE, ...arguments)
        }
    },

    /**
     * 通知接收
     * 找不到自己需要使用的通知时，自行添加并提交（注意归类）
     * @return {[type]} [description]
     */
    registerEvents() {
        this._bindEvents(this.onSuccess, EnumCfg.EEventName.ON_SUCCESS);
        this._bindEvents(this.onFail, EnumCfg.EEventName.ON_FAIL);
        //SwapNodes
        this._bindEvents(this.onSwapNodesChangeShow, EnumCfg.EEventName.ON_SWAPNODES_SHOWCHANGESHOW);
        //TIMER 计时器
        this._bindEvents(this.onTimerStart, EnumCfg.EEventName.ON_TIMER_START);
        this._bindEvents(this.onTimerStop, EnumCfg.EEventName.ON_TIMER_STOP);
        this._bindEvents(this.onTimerPause, EnumCfg.EEventName.ON_TIMER_PAUSE);
        this._bindEvents(this.onTimerChangePlaying, EnumCfg.EEventName.ON_TIMER_CHANGEPLAYING);

        this._bindEvents(this.onTimer2TimeUpdate, EnumCfg.EEventName.ON_TIMER2_TIME_UPDATE);

        // ============= 上下文【ContextTransfer】对外发送的通知 =============
        this._bindEvents(this.onContextTransferInited, EnumCfg.EEventName.ON_CONTEXT_INITED);
        this._bindEvents(this.onContextTransferLoaded, EnumCfg.EEventName.ON_CONTEXT_LOADED);
        this._bindEvents(this.onContextTransferMounted, EnumCfg.EEventName.ON_CONTEXT_MOUNTED);
        this._bindEvents(this.onContextMagicEnabledChanged, EnumCfg.EEventName.ON_CONTEXT_MAGIC_ENABLED_CHANGE);
        this._bindEvents(this.onContextKeyDown, EnumCfg.EEventName.ON_CONTEXT_KEY_DOWN);
        this._bindEvents(this.onContextKeyUp, EnumCfg.EEventName.ON_CONTEXT_KEY_UP);
        this._bindEvents(this.onContextDanceChanged, EnumCfg.EEventName.ON_CONTEXT_DANCE_CHANGE);
        this._bindEvents(this.onContextMouseMove, EnumCfg.EEventName.ON_CONTEXT_MOUSE_MOVE);
        //监听用户更新 需要开启 ContextTransfer.userUpdateListener
        this._bindEvents(this.onUsersUpdate, EnumCfg.EEventName.ON_CONTEXT_USERUPDATE);
        this._bindEvents(this.onUpdateProgress, EnumCfg.EEventName.CONTEXT_UPDATE_PROGRESS);
        // ============= 点击拖拽【ClickDrag】对外发送的通知 =============
        this._bindEvents(this.onClickDragProgress, EnumCfg.EEventName.ON_CLICK_DRAG_PROGRESS);
        this._bindEvents(this.onClickDragRight, EnumCfg.EEventName.ON_CLICK_DRAG_RIGHT);
        this._bindEvents(this.onClickDragWrong, EnumCfg.EEventName.ON_CLICK_DRAG_WRONG);
        this._bindEvents(this.onClickDragSitDown, EnumCfg.EEventName.ON_CLICK_DRAG_SITDOWN);
        this._bindEvents(this.onClickDragStateChange, EnumCfg.EEventName.ON_CLICK_DRAG_STATE_CHANGE);
        this._bindEvents(this.onClickDragStart, EnumCfg.EEventName.ON_CLICK_DRAG_START);
        // ============= 点击依次出现【ClickAppear】对外发送的通知 =============
        this._bindEvents(this.onClickAppearShowWithIndex, EnumCfg.EEventName.ON_CLICK_APPEAR_SHOW_WITH_INDEX);
        this._bindEvents(this.onClickAppearShowAll, EnumCfg.EEventName.ON_CLICK_APPEAR_SHOW_ALL);

        // ============= 点击次数变化【ClikTimes】对外发送的通知 =============
        this._bindEvents(this.onClick, EnumCfg.EEventName.ON_CLICK); //-- 不再计数时响应
        this._bindEvents(this.onClickTimesUpto, EnumCfg.EEventName.ON_CLICK_TIMES_UP_TO); //-- 计数时响应

        // ============= 动画【AnimController】对外发送的通知 =============
        this._bindEvents(this.onAnimControllerStart, EnumCfg.EEventName.ON_ANIM_CONTROLLER_START);
        this._bindEvents(this.onAnimControllerComplete, EnumCfg.EEventName.ON_ANIM_CONTROLLER_COMPLETE);
        this._bindEvents(this.onAnimControllerEvent, EnumCfg.EEventName.ON_ANIM_CONTROLLER_EVENT);
        // ============= 音频【AudioController】对外发送的通知 =============
        this._bindEvents(this.onAudioControllerStartSubtitle, EnumCfg.EEventName.ON_AUDIO_CONTROLLER_START_SUBTITLE);
        this._bindEvents(this.onAudioControllerCompleteSubtitle, EnumCfg.EEventName.ON_AUDIO_CONTROLLER_COMPLETE_SUBTITLE);
        this._bindEvents(this.onAudioControllerStartCustom, EnumCfg.EEventName.ON_AUDIO_CONTROLLER_START_CUSTOM);
        this._bindEvents(this.onAudioControllerCompleteCustom, EnumCfg.EEventName.ON_AUDIO_CONTROLLER_COMPLETE_CUSTOM);

        // ============= 字幕【SubtitleController】对外发送的通知 =============
        this._bindEvents(this.onSubtitleControllerStartWithIndex, EnumCfg.EEventName.ON_SUBTITLE_CONTROLLER_START_WITH_INDEX);

        // ============= 段落字幕【ArticleContrller】对外发送的通知 =============
        this._bindEvents(this.onArticleControllerComplete, EnumCfg.EEventName.ON_ARTICLE_CONTROLLER_COMPLETE);

        // ============= 舞台【StageController】对外发送的通知 =============
        this._bindEvents(this.onStageControllerSwitchToIndex, EnumCfg.EEventName.ON_STAGE_CONTROLLER_SWITCH_TO);

        // ============= 射击气球相关 对外发送的通知==========
        this._bindEvents(this.onShootDartsRight, EnumCfg.EEventName.ON_SHOOTDARTS_RIGHT);
        //pair
        this._bindEvents(this.onPairSelectRightIndex, EnumCfg.EEventName.ON_PAIR_SELET_RIGHT_INDEX);
        this._bindEvents(this.onPairSelect, EnumCfg.EEventName.ON_PAIR_SELET)



    },

    /**
     * 对外发送命令信息
     * @param  {[type]} eventName [description]
     * @return {[type]}           [description]
     */
    notice(eventName) {
        if (eventName) {
            return NoticeCenter.dispatchEvent(eventName, ...[].splice.call(arguments, 1));
        }
    },

    start() { },

    update(dt) { },

    /**
     * 重写以防止场景销毁时定时器继续执行(使用方法：this.setTimeout(()=>{},delay))
     * @param {[type]} callfunc [description]
     * @param {[type]} delay    [description]
     */
    setTimeout(callfunc, delay) {
        let timerId = setTimeout(callfunc, delay);
        this._timerIdArrForTimeout.push(timerId);
        return timerId;
    },

    /**
     * 重写以防止场景销毁时定时器继续执行(使用方法：this.setInterval(()=>{},interval))
     * @param {[type]} callfunc [description]
     * @param {[type]} delay    [description]
     */
    setInterval(callfunc, interval) {
        let timerId = setInterval(callfunc, interval);
        this._timerIdArrForInterval.push(timerId);
        return timerId;
    },

    _bindEvents(callFunc, eventName) {
        if (callFunc && eventName) {
            NoticeCenter.removeEvent(eventName, callFunc, this);
            NoticeCenter.addEvent(eventName, callFunc, this);
            // this._eventHash.push([eventName, callFunc]);
        }
    },

    _unbindEvents() {
        // this._eventHash.map((eventCell) => {
        //     if (eventCell) {
        //         let eventName = eventCell[0];
        //         let callFunc  = eventCell[1];
        //         if (callFunc && eventName) {
        //             NoticeCenter.removeEvent(eventName, callFunc, this);
        //         }
        //     }
        // });
        NoticeCenter.removeEventByTarget(this)
    },

    clearAllTimeout() {
        this._timerIdArrForTimeout.map((timerId) => {
            if (timerId != undefined) {
                clearTimeout(timerId);
            }
        });
    },

    clearAllInterval() {
        this._timerIdArrForInterval.map((timerId) => {
            if (timerId != undefined) {
                clearInterval(timerId);
            }
        });
    },

    onDestroy() {
        this._unbindEvents();
        //-- 要确保组件销毁时,定时器跟随销毁
        this.clearAllTimeout();
        this.clearAllInterval();
    }
});