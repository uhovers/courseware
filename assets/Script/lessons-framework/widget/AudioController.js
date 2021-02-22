/*!
 * [widget]音频控件
 * by houzehang
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');
let AudioUtil = require('./../util/AudioUtil');
const CUSTOM_AUDIO_PRIORITY = 1;
const SUBTITLE_AUDIO_PRIORTY = 1;
cc.Class({
    extends: WidgetBase,
    properties: {
        //-- 唯一组件，隐藏ID
        compId: {
            type: cc.Integer,
            default: 0,
            override: true,
            visible: false
        },
        //-- 点击音效
        clickAudio: {
            default: null,
            url: cc.AudioClip
        },
        //-- 正确音效
        rightAudio: {
            default: null,
            url: cc.AudioClip
        },
        //-- 错误音效
        wrongAudio: {
            default: null,
            url: cc.AudioClip
        },
        //-- 背景音乐
        bgMusic: {
            default: null,
            url: cc.AudioClip
        },
        //-- 魔法棒音效
        magicAudio: {
            default: null,
            url: cc.AudioClip
        },
        //-- 特殊音效
        customAudios: {
            default: [],
            type: [cc.AudioClip]
        },
        //-- 字幕音效
        subtitleAudios: {
            default: [],
            type: [cc.AudioClip]
        },
        //-- 每句字幕读音时长
        subtitleAudioDurations: [cc.Float],

        //-- 文稿音效
        articleAudios: {
            default: [],
            type: [cc.AudioClip]
        },
        //-- 阅读字幕时间间隔-ms
        _readSubtitleInterval: 700,
        _timerIdArrForSubtitleAudio: []
    },

    onLoad() {
        this._super();
        //-- 具有唯一性的组件
        this._unique = true;
    },

    events() {
        return {
            [EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE]: this.playAudioByType,
            [EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_STOP]: this._stop,
        }
    },

    _stop() {
        AudioUtil.stop();
    },

    /**
     * 根据类型播放音频
     * @param  {[type]} audioType   [音频类型(定义于:EnumCfg.EAudioType)]
     * @param  {[type]} audioIdFrom [音频起始ID(customAudio和subtitleAudio会用到)]
     * @param  {[type]} audioIdTo   [音频结束ID(仅subtitleAudio会用到)]
     * @param  {[type]} nextAuto    [是否自动播放下一句(仅subtitleAudio会用到)]
     * @return {[type]}             [无]
     */
    playAudioByType(audioType, audioIdFrom, audioIdTo, nextAuto, maxDuration, volume) {
        // console.log('MINGXI_DEBUG_LOG>>>>>>>>>audioType, audioIdFrom, audioIdTo, nextAuto, maxDuration, volume', audioType, audioIdFrom, audioIdTo, nextAuto, maxDuration, volume);
        switch (audioType) {
            case EnumCfg.EAudioType.BGM:

                AudioUtil.play(this.bgMusic);
                break;

            case EnumCfg.EAudioType.MAGIC:

                AudioUtil.play(this.magicAudio);
                break;

            case EnumCfg.EAudioType.CLICK:
                if (this._isPlayingClickAudio) return;
                this._isPlayingClickAudio = true;
                this.setTimeout(() => {
                    this._isPlayingClickAudio = false;
                }, 100);
                AudioUtil.play(this.clickAudio);
                break;

            case EnumCfg.EAudioType.RIGHT:

                AudioUtil.play(this.rightAudio);
                break;

            case EnumCfg.EAudioType.WRONG:

                AudioUtil.play(this.wrongAudio);
                break;

            case EnumCfg.EAudioType.CUSTOM:

                this._playCustomAudio(audioIdFrom, maxDuration, CUSTOM_AUDIO_PRIORITY, volume);
                break;

            case EnumCfg.EAudioType.SUBTITLE:

                this._timerIdArrForSubtitleAudio.map((timerId) => {
                    timerId != undefined && clearTimeout(timerId);
                });
                this._playSubtitleAudio(audioIdFrom, audioIdTo, nextAuto, maxDuration, SUBTITLE_AUDIO_PRIORTY);
                break;

            default:
                break;
        }
    },

    /**
     * 播放自定义声音（如小提示、旁白音、一段阅读等）
     * @param  {[type]} audioIdFrom [description]
     * @param  {[type]} maxDuration [description]
     * @return {[type]}             [description]
     */
    _playCustomAudio(audioIdFrom, maxDuration, priority, volume) {
        // console.log('MINGXI_DEBUG_LOG>>>>>>>>>play custom audio', volume);
        if (this.customAudios[audioIdFrom]) {
            AudioUtil.stop();
            let audioCallback = () => {
                //-- 通知外部播放了哪一句自定义声音
                this.notice(EnumCfg.EEventName.ON_AUDIO_CONTROLLER_COMPLETE_CUSTOM, audioIdFrom);
            }
            AudioUtil.play(this.customAudios[audioIdFrom], audioCallback, maxDuration, false, priority, volume);

            //-- 通知外部开始播放自定义声音
            this.notice(EnumCfg.EEventName.ON_AUDIO_CONTROLLER_START_CUSTOM, audioIdFrom);
        }
    },

    /**
     * 播放字幕声音
     * @param  {[type]} audioIdFrom [description]
     * @param  {[type]} audioIdTo   [description]
     * @param  {[type]} nextAuto    [description]
     * @param  {[type]} maxDuration [description]
     * @return {[type]}             [description]
     */
    _playSubtitleAudio(audioIdFrom, audioIdTo, nextAuto, maxDuration, priority) {

        maxDuration = maxDuration || this.subtitleAudioDurations[audioIdFrom];

        if (this.subtitleAudios &&
            this.subtitleAudios[audioIdFrom] &&
            (audioIdTo == undefined || audioIdTo == null || audioIdTo >= audioIdFrom)) {

            //-- 播放前停止其他
            AudioUtil.stop();

            let audioCallback = () => {
                //-- 通知外部播放了哪一句字幕
                this.notice(EnumCfg.EEventName.ON_AUDIO_CONTROLLER_COMPLETE_SUBTITLE, audioIdFrom);
                //-- 判断是否自动播放下一句
                if (nextAuto) {
                    this._timerIdArrForSubtitleAudio.push(setTimeout(() => {
                        this._playSubtitleAudio(audioIdFrom + 1, audioIdTo, nextAuto);
                    }, this._readSubtitleInterval));
                }
            }
            AudioUtil.play(this.subtitleAudios[audioIdFrom], audioCallback, maxDuration, false, priority);

            //-- 通知外部开始播放字幕阅读声音
            this.notice(EnumCfg.EEventName.ON_AUDIO_CONTROLLER_START_SUBTITLE, audioIdFrom);

            //-- 驱动字幕播放
            this.notice(EnumCfg.EEventName.SUBTITLE_CONTROLLER_PLAY, this.compId, audioIdFrom, maxDuration);
        }
    },

    update(dt) {
        AudioUtil.update(dt);
    },

    onDestroy() {
        this._super();
        this._timerIdArrForSubtitleAudio.map((timerId) => {
            if (timerId != undefined) {
                clearTimeout(timerId);
            }
        });
    }
});