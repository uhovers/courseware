/*!
 * [remote]上下文
 * by houzhenag
 */
const WidgetBase = require('./../basement/WidgetBase');
const EnumCfg = require('./../config/EnumCfg');
const TouchUtil = require('./../util/TouchUtil');
const DraftCfg = require("../../DraftCfg");
const ShowFeature = require('../../ShowFeature')
const LessonTag = require("../../LessonTag");

window.__ContextTransfer_Events = {}
cc.Class({
    extends: WidgetBase,
    properties: {
        compId: {
            type: cc.Integer,
            default: 0,
            override: true,
            visible: false
        },
        tag: 'default tag',
        secretNodes: [cc.Node],
        hideForTeacher: [cc.Node],

        watchingKeys: {
            default: [],
            type: [cc.Enum(EnumCfg.EWatchingKeys)]
        },
        mouseMoveListener: false,
        userUpdateListener: false,
        _isTeacher: false,
        btnCloseMagic: cc.Node,
        _audioCallback: null,
        _audio: null,
        _enableMagic: false, //是否开启魔法棒
        _accessData: {
            default: {},
        },
    },

    __bind_scene_event(eventName, handler) {
        if (window.__ContextTransfer_Events[eventName]) {
            cc.director.getScene().off(eventName, window.__ContextTransfer_Events[eventName])
        }
        window.__ContextTransfer_Events[eventName] = handler;
        cc.director.getScene().on(eventName, handler)
    },

    onLoad() {
        this._accessData = {};
        this._super();


        //-- 具有唯一性的组件
        this._unique = true;
        console.log('MINGXI_DEBUG_LOG>>>>>>>>>register scene loaded event','');
        this.__bind_scene_event("LOADED", (event) => {
            let context = event.detail.context
            this.sprata_context = context;
            console.log(context);

            setTimeout(() => {
                this.notice(EnumCfg.EEventName.ON_CONTEXT_LOADED, this.sprata_context);
            });
            this._sprata_seekActorProgress(null, null, null, true)
        });
        // this.__bind_scene_event("INITED", (event) => {
        //     let context = event.detail.context
        //     this.sprata_context = context;
        //     console.log(context);

        //     setTimeout(() => {
        //         this.notice(EnumCfg.EEventName.ON_CONTEXT_INITED, this.sprata_context);
        //     });
        // });
        this.__bind_scene_event("MOUNTED", (event) => {
            console.log('MINGXI_DEBUG_LOG>>>>>>>>>MOUNTED','');
            let context = event.detail.context
            context.board.mouseState = true;
            this.context = context;
            this._isTeacher = context && context.users && context.users.master;
            this._showOutline();
            this._updateSecretNodesVisible();
            this._checkHeapUpAudios();
            this._students = context && context.globalDataMgr && context.globalDataMgr.accessData.users;
            this._students && this._students.sort((pre, next) => {
                return pre.id - next.id;
            })
            this._users = context && context.users;
            setTimeout(() => {
                this.notice(EnumCfg.EEventName.ON_CONTEXT_MOUNTED, this.context, this._students, this._users);
            });
            this.context && this.context.registerKeys && this.context.registerKeys(this.watchingKeys);
            let curScene = cc.director.getScene();
            let lessonId = /\d+$/.exec(curScene._name)[0];
            this.context && this.context.showFeature && this.context.showFeature(ShowFeature[lessonId]);
            if (this.mouseMoveListener) {
                if (this.context) {
                    this.context.onMouseMove = (x, y) => {
                        this.notice(EnumCfg.EEventName.ON_CONTEXT_MOUSE_MOVE, x, y);
                    }
                }
            }
            if (context && context.globalDataMgr && context.globalDataMgr.accessData && context.globalDataMgr.accessData.users) {
                this._accessData = context.globalDataMgr.accessData
                let tempValue = this._getNetData();
                if (tempValue) {
                    this._setNetData(tempValue);
                }
                if (this.userUpdateListener) {
                    context.globalDataMgr.onUsersUpdate = () => {
                        this.onUsersUpdate();
                    };
                }
            }
        });
        this.__bind_scene_event("ENABLE_MAGIC", () => {
            console.log('MINGXI_DEBUG_LOG>>>>>>>>>context transfer ENABLE_MAGIC',true);
            this.notice(EnumCfg.EEventName.ON_CONTEXT_MAGIC_ENABLED_CHANGE, true, !!this._isTeacher);
            if (this.btnCloseMagic && (this._isTeacher || !window.ONLINE)) {
                this.btnCloseMagic.active = true;
            }
            this._enableMagic = true;
        }) 
        this.__bind_scene_event("DISABLE_MAGIC", () => {
            console.log('MINGXI_DEBUG_LOG>>>>>>>>>context transfer DISABLE_MAGIC');
            this.notice(EnumCfg.EEventName.ON_CONTEXT_MAGIC_ENABLED_CHANGE, false, !!this._isTeacher);
            if (this.btnCloseMagic) {
                this.btnCloseMagic.active = false;
            }
            this._enableMagic = false;
        });
        this.__bind_scene_event("put_dance", (event) => {
            let curScene = cc.director.getScene();
            let lessonId = /\d+$/.exec(curScene._name)[0];
            this.context && this.context.featureStart && this.context.featureStart(event.detail.id, ShowFeature[lessonId], lessonId);
            this.notice(EnumCfg.EEventName.ON_CONTEXT_DANCE_CHANGE, true, event.detail.id);
        });
        this.__bind_scene_event("back_dance", (event) => {
            this.context && this.context.featureEnd && this.context.featureEnd(event.detail.id);
            this.notice(EnumCfg.EEventName.ON_CONTEXT_DANCE_CHANGE, false, event.detail.id);
        });
        this.__bind_scene_event("ENDED", (event) => {
            if (event.detail.url === this._audio) {
                this._audioCallback && this._audioCallback();
                this._audioCallback = null;
            }
        });
        if (this.mouseMoveListener) {
            if (!window.ONLINE && !window.RELEASE_MODE) {
                cc.director.getScene().getChildByName('Canvas').on(cc.Node.EventType.MOUSE_MOVE, (event) => {
                    this.notice(EnumCfg.EEventName.ON_CONTEXT_MOUSE_MOVE, event._x, event._y);
                })
            }
        }
    },
    //预习是否看过
    _isPreviewPassed(callback) {
        let value = false
        if (window.ONLINE) {
            value = this.context && typeof this.context.isPreviewPassed == 'function' && this.context.isPreviewPassed()
        } else {
            value = !!cc.sys.localStorage.getItem('isPreviewPassed')
        }
        if (typeof callback == 'function') {
            callback(value)
        }
        return value
    },
    // 记录预习是否看过
    _setPreViewPassed() {
        if (window.ONLINE) {
            if (this.context && typeof this.context.setPreviewPassed == 'function') {
                this.context.setPreviewPassed()
            }
        } else {
            cc.sys.localStorage.setItem('isPreviewPassed', true)
        }
    },
    //课件下一页
    _playNextPage() {
        if (window.ONLINE) {
            if (this.context && typeof this.context.playNextPage == 'function') {
                this.context.playNextPage()
            }
        } else {
            let lessonId = parseInt(/\d+$/.exec(cc.director.getScene().name)[0]);
            cc.director.loadScene(`lesson${lessonId + 1}`)
        }
        this._playNextPage = () => { }
    },
    //课件前一页
    _playPrevPage() {
        if (window.ONLINE) {
            if (this.context && typeof this.context.playPrevPage == 'function') {
                this.playPrevPage()
            }
        } else {
            let lessonId = parseInt(/\d+$/.exec(cc.director.getScene().name)[0]);
            cc.director.loadScene(`lesson${lessonId - 1}`)
        }
        this._playPrevPage = () => { }
    },
    _getNetData(callfunc) {
        if (!window.ONLINE) {
            let value = cc.sys.localStorage.getItem('net_data')
            this._accessData.net_data = value == "undefined" ? undefined : JSON.parse(value);
        }
        if (callfunc) {
            callfunc(this._accessData.net_data);
        }
        return this._accessData.net_data;
    },
    _setNetData(value) {
        if (!window.ONLINE) {
            cc.sys.localStorage.setItem('net_data', value === undefined ? undefined : JSON.stringify(value));
        }
        this._accessData.net_data = value;
    },
    _setNetDataOfStudent(key, value) {
        if (!window.ONLINE) {
            cc.sys.localStorage.setItem(key, value === undefined ? undefined : JSON.stringify(value));
        } else {
            if (this.context && this.context.users && this.context.users.master) {
                if (!this._accessData.net_data) {
                    this._accessData.net_data = {};
                }
                this._accessData.net_data[key] = value
            } else {
                this.context && this.context.magicStore && this.context.magicStore(key, value)
            }

        }
    },
    onDestroy(){
        this._super()
        console.log('MINGXI_DEBUG_LOG>>>>>>>>>contextTransfer destroy', this.tag);
    },
    _getNetDataOfStudent(key, callfunc) {
        if (!window.ONLINE) {
            let value = cc.sys.localStorage.getItem(key)
            if (value !== 'undefined') {
                value = JSON.parse(value)
            } else {
                value = undefined
            }
            callfunc(value)
        } else {
            if (this.context.users.master) {
                if (!this._accessData.net_data) {
                    this._accessData.net_data = {}
                }
                callfunc(this._accessData.net_data[key]);
            } else {
                let users = {}
                for (let i = 0, length = this._accessData.users.length; i < length; ++i) {
                    if (this._users.id == this._accessData.users[i].id) {
                        users = this._accessData.users[i]
                        break
                    }
                }
                callfunc(users[key])
            }
        }
    },
    start() {
        this._init();

        if (!window.ONLINE) {
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        }
        if (!window.ONLINE) {
            this.notice(EnumCfg.EEventName.ON_CONTEXT_MOUNTED, {});
        }
    },
    onUsersUpdate() {
        this.notice(EnumCfg.EEventName.ON_CONTEXT_USERUPDATE);
    },
    /**
     * 监听键盘按键(开发环境使用)
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    onKeyDown(event) {
        let canvas = cc.find('Canvas');
        let debuger = canvas.getComponent('Debuger');
        switch (event.keyCode) {

            //-- [F1]呼出调试菜单
            case cc.KEY.f1:
                debuger ? debuger.destroy() : (canvas.addComponent('Debuger')._init());
                break;

            default:
                break;
        }

    },

    events() {
        return {
            [EnumCfg.EEventName.CONTEXT_PLAY_FIRECRACKER]: this._playFirecracker,
            [EnumCfg.EEventName.CONTEXT_STOP_ONCE]: this._stopOnce,
            [EnumCfg.EEventName.CONTEXT_UPDATE_PROGRESS]: this._updateProgress,
            [EnumCfg.EEventName.CONTEXT_ENABLE_MAGIC]: this._setMagicEnabled,
            [EnumCfg.EEventName.CONTEXT_PLAY_AUDIO]: this._playAudio,
            [EnumCfg.EEventName.CONTEXT_STOP_AUDIO]: this._stopAudio,
            [EnumCfg.EEventName.CONTEXT_SEND_SMS]: this._sendSMS,
            [EnumCfg.EEventName.CONTEXT_DREAM_START]: this._startDream,
            [EnumCfg.EEventName.CONTEXT_DREAM_END]: this._endDream,
            [EnumCfg.EEventName.CONTEXT_PICK_STAR]: this._pickStar,
            [EnumCfg.EEventName.CONTEXT_SETNETDATA]: this._setNetData,
            [EnumCfg.EEventName.CONTEXT_GETNETDATA]: this._getNetData,
            [EnumCfg.EEventName.CONTEXT_SETNETDATA_OF_STUDENT]: this._setNetDataOfStudent,
            [EnumCfg.EEventName.CONTEXT_GETNETDATA_OF_STUDENT]: this._getNetDataOfStudent,

            [EnumCfg.EEventName.CONTEXT_ISPREVIEWPASSED]: this._isPreviewPassed,
            [EnumCfg.EEventName.CONTEXT_SETPREVIEWPASSED]: this._setPreViewPassed,
            [EnumCfg.EEventName.CONTEXT_PLAYNEXTPAGE]: this._playNextPage,
            [EnumCfg.EEventName.CONTEXT_PLAYPREVPAGE]: this._isPreviewPassed,


            /// 斯巴达

            [EnumCfg.EEventName.ON_CONTEXT_PUT_DANCE]: this._sprata_putDance,
            [EnumCfg.EEventName.ON_CONTEXT_SEEK_MASTER_BRANCH]: this._sprata_seekMasterProgress,
            [EnumCfg.EEventName.ON_CONTEXT_SEEK_ACTOR_BRANCH]: this._sprata_seekActorProgress,
            [EnumCfg.EEventName.ON_CONTEXT_BACK_DANCE]: this._sprata_backDance,
            [EnumCfg.EEventName.ON_CONTEXT_START_AUDIORECORD]: this._sprata_startAudioRecord,
            [EnumCfg.EEventName.ON_CONTEXT_STOP_AUDIORECORD]: this._sprata_stopAudioRecord,
            [EnumCfg.EEventName.ON_CONTEXT_SHOW_LOTTERY]: this._sprata_showLottery,
            [EnumCfg.EEventName.ON_CONTEXT_HIDE_LOTTERY]: this._sprata_hideLottery,
            [EnumCfg.EEventName.ON_CONTEXT_SHOW_RESPONDER]: this._sprata_showResponder,
            [EnumCfg.EEventName.ON_CONTEXT_HIDE_RESPONDER]: this._sprata_hideResponder,
            [EnumCfg.EEventName.ON_CONTEXT_ADD_STAR]: this._sprata_addStar,
            [EnumCfg.EEventName.ON_CONTEXT_FULL_SCREEN]: this._sprata_fullScreen,
            [EnumCfg.EEventName.ON_CONTEXT_FEED_BACK_PK_RESULT]: this._sprata_feedBackPKResult,
            [EnumCfg.EEventName.ON_CONTEXT_SWITCH_MASTER_BRANCH]: this._sprata_switchMasterBranch,
            [EnumCfg.EEventName.ON_CONTEXT_NEXT_PAGE]: this._sprata_nextPage,
            [EnumCfg.EEventName.ON_CONTEXT_SWITCH_ACTOR_BRANCH]: this._sprate_switchActorBranch,
            [EnumCfg.EEventName.ON_CONTEXT_MUTE_VIDEO]: this._sprata_muteVideo,

            [EnumCfg.EEventName.ON_CONTEXT_ADD_STAR_TO_ACTOR]: this._sprate_addStarToActor,
            [EnumCfg.EEventName.ON_CONTEXT_START_AUDIO_RECORD_WITH_TIME]: this._sprate_startAudioRecordWithTime,
            [EnumCfg.EEventName.ON_CONTEXT_COURSE_FINISHED]: this._sprate_courseFinished,

            [EnumCfg.EEventName.CHANGE_USERNAME]: this._sprate_changeUsername,
            [EnumCfg.EEventName.CHANGE_ACTORNAME]: this._sprate_changeActorname,

            [EnumCfg.EEventName.BEGIN_COURSE]: this._sprate_begin_course,
        }
    },

    //-- 关闭划线
    _stopOnce(_boolean) {
        if (this.context && this.context.board) {
            this.context.board.stoponce = !!_boolean;
        }
    },
    //给学生发送星星
    _pickStar(value) {
        if (Number.isInteger(value) && value > 0) {
            console.log(value);
            this.context && this.context.pickStar && this.context.pickStar(value);
        }
    },
    //-- 播放烟花
    _playFirecracker() {
        this.context && this.context.firecracker();
    },

    //-- 更新进度
    _updateProgress(progressVal) {
        progressVal = progressVal || 0;
        progressVal = Math.min(100, progressVal);
        progressVal == 100 && this._playFirecracker();
        console.log("progressVal:  " + progressVal);
        this.context && this.context.setProgress(progressVal);
    },

    //-- 显示讲义
    _showOutline() {
        let curScene = cc.director.getScene();
        let lessonId = /\d+$/.exec(curScene._name);

        let _draftStr = DraftCfg[lessonId];
        if (this.context && _draftStr) {
            this.context.showDraft(_draftStr);
        }
        console.log(_draftStr);
        let _tag = LessonTag[lessonId]
        if(this.context && this.context.showLessonTag && _tag){
            this.context.showLessonTag(_tag)
        }
    },

    //-- 显示/隐藏某些节点（一般用于对学生隐藏某些UI）
    _updateSecretNodesVisible() {
        console.log('MINGXI_DEBUG_LOG>>>>>>>>>window.ONLINE',window.ONLINE, this._isTeacher);
        this.secretNodes.map((_setSecretNode) => {
            _setSecretNode.isOnlyTeacherUse = true;
            if (window.ONLINE) {
                _setSecretNode && (_setSecretNode.opacity = this._isTeacher ? 255 : 0);
                console.log('MINGXI_DEBUG_LOG>>>>>>>>>_setSecretNode',_setSecretNode.opacity);
            } else {
                let node = new cc.Node;
                node.addComponent(cc.Label).string = 'teacher'
                node.setColor(cc.color(255, 0, 0, 255))
                node.parent = _setSecretNode
            }
        });

        this.hideForTeacher.map((_setSecretNode) => {
            if (window.ONLINE) {
                _setSecretNode && (_setSecretNode.opacity = this._isTeacher ? 0 : 255);
            } else {
                let node = new cc.Node;
                node.addComponent(cc.Label).string = 'student'
                node.setColor(cc.color(255, 0, 0, 255))
                node.parent = _setSecretNode
            }
        });
    },

    //-- 收回/给出魔法棒
    _setMagicEnabled(enabled) {
        console.log('ContestTransfer:setMagicEnabled:', !!enabled)
        if (this.context) {
            this.context.enableMagic(!!enabled);
        } else {
            if (enabled) {
                cc.director.getScene().emit("ENABLE_MAGIC");
            } else {
                cc.director.getScene().emit("DISABLE_MAGIC");
            }
        }
    },

    //-- 播放音频
    _playAudio(audio, audioCallback, loop = false) {
        if (this.context) {
            this.context.soundMng.play(audio, !!audioCallback, !!loop);
            this._audio = audio;
            this._audioCallback = audioCallback;
        } else {
            this._audioHeapUp = [audio, audioCallback];
        }
    },

    //-- 停止播放音频
    _stopAudio() {
        if (this.context) {
            this.context.soundMng.stop();
        }
    },

    //-- 检测未及时播放的音频
    _checkHeapUpAudios() {
        if (this._audioHeapUp) {
            this._playAudio(...this._audioHeapUp);
            this._audioHeapUp = null;
        }
    },

    //-- 发送短信
    _sendSMS(message) {
        if (this.context) {
            this.context.sendSMS(message);
        }
    },

    //-- 监听按键
    _watchRegisteredKeys() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event) => {
            let keyCode = event.keyCode;
            if (~this.watchingKeys.indexOf(keyCode)) {
                this.notice(EnumCfg.EEventName.ON_CONTEXT_KEY_DOWN, this.watchingKeys.indexOf(keyCode));
            }
        }, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, (event) => {
            let keyCode = event.keyCode;
            if (~this.watchingKeys.indexOf(keyCode)) {
                this.notice(EnumCfg.EEventName.ON_CONTEXT_KEY_UP, this.watchingKeys.indexOf(keyCode));
            }
        }, this)
    },

    _init() {
        this.btnCloseMagic = this.btnCloseMagic || cc.find('Canvas').getChildByName('magicRegain');
        if (!window.ONLINE) {
            this._showOutline();
        }
        if (this.btnCloseMagic) {
            this.btnCloseMagic.active = false;
            TouchUtil.addClickBtn(this.btnCloseMagic, () => {
                console.log('MINGXI_DEBUG_LOG>>>>>>>>>btnCloseMagic click','');
                this._setMagicEnabled(false);
                return true;
            })
            this.secretNodes.push(this.btnCloseMagic);
        }
        this._updateSecretNodesVisible();
    },
    _startDream() {
        this.context && this.context.dreamStart && this.context.dreamStart();
    },
    _endDream() {
        this.context && this.context.dreamStart && this.context.dreamEnd();
    },
    // sprata
    /////  ---------------       讲台
    _sprata_putDance(type, x, y, w, h, call, stopTimmerFunc) {
        if (this.sprata_context && this.sprata_context.putDance) {
            this.sprata_context.putDance(type, x, y, w, h, call, stopTimmerFunc);
        }
    },
    _sprata_backDance(type) {
        if (this.sprata_context && this.sprata_context.backDance) {
            this.sprata_context.backDance(type);
        }
    },
    _sprata_seekMasterProgress(needUpdateProgress = false, from, to, after) {
        if (this.sprata_context && this.sprata_context.seekMasterProgress) {
            this.sprata_context.seekMasterProgress(needUpdateProgress, from, to, after);
        }
    },
    _sprata_seekActorProgress(from, to, after, withOutPlay) {
        if (this.sprata_context && this.sprata_context.seekActorProgress) {
            this.sprata_context.seekActorProgress(from, to, after, withOutPlay);
        }
    },
    _sprata_muteVideo(type, isMuted){
        if (this.sprata_context && this.sprata_context.muteVideo) {
            this.sprata_context.muteVideo(type, isMuted);
        }
    },
    /////  ---------------       录音
    _sprata_startAudioRecord(content, withMic, stopFunc, overFunc) {
        if (this.sprata_context && this.sprata_context.startAudioRecord) {
            this.sprata_context.startAudioRecord(content, withMic, stopFunc, overFunc);
        }
    },
    _sprata_stopAudioRecord(overFunc) {
        if (this.sprata_context && this.sprata_context.stopAudioRecord) {
            this.sprata_context.stopAudioRecord(overFunc);
        }
    },
    /////  ---------------       摇号器
    _sprata_showLottery(isSelf, overFunc) {
        if (this.sprata_context && this.sprata_context.showLottery) {
            this.sprata_context.showLottery(isSelf, overFunc);
        }
    },
    _sprata_hideLottery() {
        if (this.sprata_context && this.sprata_context.hideLottery) {
            this.sprata_context.hideLottery();
        }
    },
    /////  ---------------       抢答器
    _sprata_showResponder(clickFunc) {
        if (this.sprata_context && this.sprata_context.showResponder) {
            this.sprata_context.showResponder(clickFunc);
        }
    },
    _sprata_hideResponder() {
        if (this.sprata_context && this.sprata_context.hideResponder) {
            this.sprata_context.hideResponder();
        }
    },
    /////  ---------------       发星星
    _sprata_addStar(data) {
        if (this.sprata_context && this.sprata_context.addStar) {
            this.sprata_context.addStar(data);
        }
    },
    /////  ---------------       切全屏
    _sprata_fullScreen(isFull) {
        console.log('MINGXI_DEBUG_LOG>>>>>>>>>_sprata_fullScreen',isFull, this.tag);
        if (this.sprata_context && this.sprata_context.fullScreen) {
            this.sprata_context.fullScreen(isFull);
        }
    },
    /////  ---------------       交互结果反馈
    _sprata_feedBackPKResult(detail = { myCost: 0, actorCost: 0 }) {
        if (this.sprata_context && this.sprata_context.feedbackPkResult) {
            this.sprata_context.feedbackPkResult(detail);
        }
    },
    /////  ---------------       切分支
    _sprata_switchMasterBranch(prefebId, stepId, index, callfunc) {
        if (this.sprata_context && this.sprata_context.switchMasterBranch) {
            this.sprata_context.switchMasterBranch(prefebId, stepId, index, callfunc);
        }
    },
    _sprata_nextPage(prefabId, sceneType) {
        if (this.sprata_context && this.sprata_context.nextPage) {
            this.sprata_context.nextPage(prefabId, sceneType);
        }
    },

    _sprate_switchActorBranch(prefebId, stepId, index) {
        if (this.sprata_context && this.sprata_context.switchActorBranch) {
            this.sprata_context.switchActorBranch(prefebId, stepId, index);
        }
    },
    _sprate_addStarToActor(count){
        if (this.sprata_context && this.sprata_context.addStarToActor) {
            if (this.tag) {
                console.log('MINGXI_DEBUG_LOG>>>>>>>>>_sprate_addStarToActor tag count', this.tag, count);
                this.sprata_context.addStarToActor(count);
            }
        }
    },
    _sprate_startAudioRecordWithTime(content, time, callfunc, stopFunc){
        if (this.sprata_context && this.sprata_context.startAudioRecordWithTime) {
            this.sprata_context.startAudioRecordWithTime(content, time, callfunc, stopFunc);
        }
    },
    /**
     * 当前教室播放结束
     */
    _sprate_courseFinished(){
        if (this.sprata_context && this.sprata_context.onCourseComplete) {
            this.sprata_context.onCourseComplete();
        }
    },

    /**
     * 课上修改自己的名字
     * @param {*} name 
     */
    _sprate_changeUsername(name) {
        if (this.sprata_context && this.sprata_context.changeUsername) {
            this.sprata_context.changeUsername(name)
        }
    },

    /**
     * 课上修改演员的名字
     * @param {*} name 
     */
    _sprate_changeActorname(name) {
        if (this.sprata_context && this.sprata_context.changeActorname) {
            this.sprata_context.changeActorname(name)
        }
    },
    
    /**
     * 倒计时结束开始上课
     */
    _sprate_begin_course() {
        if (this.sprata_context && this.sprata_context.beginCourse) {
            this.sprata_context.beginCourse()
        }
    }
});