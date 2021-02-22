/*!
 * [widget]字幕控件
 * by houzehang
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');

cc.Class({
    extends: WidgetBase,

    properties: {
        //-- 字幕预制体
        subtitle: {
            type: cc.Prefab,
            default: null
        },
        bottom:{
            default: 30,
            type: cc.Integer
        },
        subtitleHeight:{
            default: 243,
            type: cc.Integer,
        },

        //结束自动隐藏 字
        autoHideFontOnEnd: true,
        //-- 红色字幕纹理资源
        redSentences: [cc.SpriteFrame],
        //-- 黑色字幕纹理资源
        blackSentences: [cc.SpriteFrame],
        // 通用白色字母纹理资源
        commonSentences: [cc.SpriteFrame],
        //-- 每句字幕的时间长度-s
        audioTimeLengthArr: [cc.Float],
        //-- 当前序号
        _curPlayIndex: 0,
        //-- 播放完成标志
        _doneFlag: false,
        //-- 暂停标志
        _pauseFlag: false,
    },

    events() {
        return {
            [EnumCfg.EEventName.SUBTITLE_CONTROLLER_PLAY]: this._playByIndex,
            [EnumCfg.EEventName.SUBTITLE_CONTROLLER_PAUSE]: this._pause,
            [EnumCfg.EEventName.SUBTITLE_CONTROLLER_GOON]: this._goon,
            [EnumCfg.EEventName.SUBTITLE_CONTROLLER_HIDE]: this._hide,
        }
    },

    onLoad() {
        this._super();
    },

    start() {
        this._init();
    },

    _init() {
        this.subtitleNode = cc.instantiate(this.subtitle);
        this.blackMask = this.subtitleNode.getChildByName("blackMask");
        this.redMask = this.subtitleNode.getChildByName("redMask");
        this.redSubtitle = this.redMask.getChildByName("redSubtitle");
        this.blackSubtitle = this.blackMask.getChildByName("blackSubtitle");

        if(this.subtitleHeight > 0 &&  this.subtitleHeight != 243){
            let bg = this.subtitleNode.getChildByName("subtitleBg");
            if(bg){
                bg.scaleY = this.subtitleHeight/243;
            }
        }
   
        if(this.subtitleHeight > 0){
            this.subtitleNode.anchorY = 0;
            let winVisibleSize = cc.view.getVisibleSize();
            this.subtitleNode.y = -winVisibleSize.height / 2 + this.bottom + this.subtitleHeight / 2; 
        }

        this.node.addChild(this.subtitleNode);
        this.subtitleNode.active = false;
    },

    /**
     * 播放字幕
     * @param  {Number} compId [description]
     * @param  {Number} index [description]
     * @return {[type]}        [description]
     */
    _playByIndex(compId = 0, index, maxDuration) {
        if (arguments.length == 1) {
            index = compId;
            compId = 0;
        } else if (arguments.length == 2) {
            maxDuration = index;
            index = compId;
            compId = 0;
        }
        if (compId !== null && compId != this.compId) return;

        if (maxDuration) {
            this.audioTimeLengthArr[index] = maxDuration;
        }
        this._play(index);
    },

    /**
     * 播放字幕
     * @param  {Number} idx [description]
     * @return {[type]}        [description]
     */
    _play(idx) {
        if (((this.blackSentences[idx] && this.redSentences[idx]) || this.commonSentences[idx]) && this.subtitleNode) {
            this._doneFlag = false;
            this._curPlayIndex = idx;
            this._timerIdHideSubtitle != undefined && clearTimeout(this._timerIdHideSubtitle);
            //-- 显示字幕
            this.subtitleNode.active = true;
            //-- 字幕图片资源切换
            this.blackSubtitle.getComponent(cc.Sprite).spriteFrame = this.commonSentences[this._curPlayIndex] || this.blackSentences[this._curPlayIndex];
            this.redSubtitle.getComponent(cc.Sprite).spriteFrame = this.commonSentences[this._curPlayIndex] || this.redSentences[this._curPlayIndex];
            //-- 字幕尺寸调整
            let blackNode = this.commonSentences[this._curPlayIndex] ? this.commonSentences[this._curPlayIndex] : this.blackSentences[this._curPlayIndex];
            let redNode = this.commonSentences[this._curPlayIndex] ? this.commonSentences[this._curPlayIndex] : this.redSentences[this._curPlayIndex];
            this.blackSubtitleSize = blackNode.getOriginalSize();
            this.redSubtitleSize = redNode.getOriginalSize();
            this.blackSubtitle.setContentSize(this.blackSubtitleSize);
            this.redSubtitle.setContentSize(this.redSubtitleSize);
            //-- 遮罩尺寸调整
            this.blackMask.setContentSize(cc.size(0, this.blackSubtitleSize.height));
            this.redMask.setContentSize(cc.size(0, this.redSubtitleSize.height));
            //-- 遮罩位置调整
            this.blackMask.setPositionX(-this.blackSubtitleSize.width >> 1);
            this.redMask.setPositionX(-this.redSubtitleSize.width >> 1);
            //-- 字幕位置调整
            this.blackSubtitle.setPositionX(this.blackSubtitleSize.width >> 1);
            this.redSubtitle.setPositionX(this.redSubtitleSize.width >> 1);
        }
    },

    /**
     * 暂停
     * @param  {Number} compId [description]
     * @return {[type]}        [description]
     */
    _pause(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this._pauseFlag = true;
    },

    /**
     * 继续
     * @param  {Number} compId [description]
     * @return {[type]}        [description]
     */
    _goon(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this._pauseFlag = false;
    },

    /**
     * 隐藏
     * @param  {Number} compId [description]
     * @return {[type]}        [description]
     */
    _hide(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this.subtitleNode && (this.subtitleNode.active = false);
    },

    update(dt) {
        //-- 实时更新遮罩的宽度，达到播放字幕的效果
        if (this._doneFlag || this._pauseFlag || !this.subtitleNode.active) return;
        let audioTimeLength = this.audioTimeLengthArr[this._curPlayIndex] || 1;
        let addWidth = (this.blackSubtitleSize.width / audioTimeLength) * dt;
        let finalWidth = Math.min(this.blackMask.getContentSize().width + addWidth, this.blackSubtitleSize.width);
        this.blackMask.setContentSize(cc.size(finalWidth, this.blackSubtitleSize.height));
        this.redMask.setContentSize(cc.size(finalWidth, this.redSubtitleSize.height));

        if (this.blackSubtitleSize.width <= finalWidth) {
            if (this.autoHideFontOnEnd) {
                this._timerIdHideSubtitle = setTimeout(() => {
                    if (this.subtitleNode) this.subtitleNode.active = false;
                }, 1400);
            }
            this._doneFlag = true;
        }
    },

    onDestroy() {
        this._super();
        this._timerIdHideSubtitle != undefined && clearTimeout(this._timerIdHideSubtitle);
    }
});