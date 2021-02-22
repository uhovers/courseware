// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
let {
    WidgetBase,
    EnumCfg,
    DraftCfg,
    NoticeCenter,
    LogicBase,
    TouchUtil,
    AudioUtil,
    AnimUtil,
    ActionUtil,
} = require('../importer');
cc.Class({
    extends: WidgetBase,

    properties: {
        mLeftButton: cc.Node,
        mRightButton: cc.Node,
        mLevel: 0,
        mPage: [cc.Node],
        mAudioIndex: -1
    },
    events() {
        return {
            [EnumCfg.EEventName.PAGE_CONTROLLER_SET_PAGE]: this.setPage,
        }
    },
    setPage(comId, pageIndex) {
        if (comId == this.compId) {

        }
        if (pageIndex != undefined) {
            this.mLevel = pageIndex
        }
        if (this.mLevel <= 0) {
            this.mLevel = 0
        }
        if (this.mLevel >= this.mPage.length) {
            this.mLevel = this.mPage.length - 1
        }
        if (this.mLevel > 0 && this.mPage.length > 1) {
            if (this.mLeftButton) this.mLeftButton.active = true
        } else {
            if (this.mLeftButton) this.mLeftButton.active = false
        }
        if (this.mLevel < this.mPage.length - 1 && this.mPage.length > 1) {
            if (this.mRightButton) this.mRightButton.active = true
        } else {
            if (this.mRightButton) this.mRightButton.active = false
        }
        this.mPage.forEach(element => element.active = false)
        if (this.mPage[this.mLevel]) {
            this.mPage[this.mLevel].active = true
        }
    },
    start() {
        TouchUtil.addClickBtn(this.mLeftButton, () => {
            --this.mLevel;
            this.setPage()
            if (this.mAudioIndex == -1) {
                NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.CLICK)
            } else {
                NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.SUBTITLE, this.mAudioIndex)
            }
            return true
        })
        TouchUtil.addClickBtn(this.mRightButton, () => {
            ++this.mLevel;
            this.setPage()
            if (this.mAudioIndex == -1) {
                NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.CLICK)
            } else {
                NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.SUBTITLE, this.mAudioIndex)
            }
            return true
        })
    },

});
