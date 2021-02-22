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
} = require('./../importer');
cc.Class({
    extends: LogicBase,

    properties: {
        PlayBtn: cc.Node,
        RePlayBtn: cc.Node,
        ReplayCurrentBtn: cc.Node,
        NextPlayBtn: cc.Node,
        Font: [cc.Node],
        HideFont: [cc.Boolean],
        SwapAnimIndex: [cc.Integer],
        AddAnimationCount: [cc.Integer],
        AudioLength: -1,
        StartAudioIndex: 0,
        NextPlayIndex: [cc.Integer],
        PlayOnStart: false,
        _currentCur: 0,
    },

    start() {
        if (this.PlayOnStart) {
            cc.director.getScene().emit(EnumCfg.EEventName.ON_CLICK_SHOW_HIDE_NODE_SET_ENABLE, true)
            this.playAudioSubtitle(this.StartAudioIndex);
            if (this.RePlayBtn) {
                this.RePlayBtn.active = true;
            }
            if (this.NextPlayBtn) {
                this.NextPlayBtn.active = true;
            }
            if (this.PlayBtn) {
                this.PlayBtn.destroy();
            }
        }
        this.PlayBtn && TouchUtil.addClickBtn(this.PlayBtn, () => {
            this.PlayBtn.destroy();
            cc.director.getScene().emit(EnumCfg.EEventName.ON_CLICK_SHOW_HIDE_NODE_SET_ENABLE, true)
            this.playAudioSubtitle(this.StartAudioIndex);
            if (this.RePlayBtn) {
                this.RePlayBtn.active = true;
            }
            if (this.NextPlayBtn) {
                this.NextPlayBtn.active = true;
            }
            if (this.ReplayCurrentBtn) {
                this.ReplayCurrentBtn.active = true;
            }
            this.unscheduleAllCallbacks()
            return true;
        })
        this.RePlayBtn && TouchUtil.addClickBtn(this.RePlayBtn, () => {
            this.unscheduleAllCallbacks();
            this.playAudioSubtitle(this.StartAudioIndex);
            this.unscheduleAllCallbacks()
            return true;
        })
        let cur = 0;
        this.NextPlayBtn && TouchUtil.addClickBtn(this.NextPlayBtn, () => {
            this.unscheduleAllCallbacks();
            this.playAudioSubtitle(this.NextPlayIndex[cur]);
            this._currentCur = this.NextPlayIndex[cur];
            if (!this.NextPlayIndex[++cur]) {
                this.NextPlayBtn.active = false;
            }
            this.unscheduleAllCallbacks()
            return true;
        })
        TouchUtil.addClickBtn(this.ReplayCurrentBtn, () => {
            this.unscheduleAllCallbacks();
            this.playAudioSubtitle(this._currentCur);
            return true;
        })
        for (let i = 0; i < this.Font.length; i++) {
            this.HideFont[i] = typeof (this.HideFont[i]) === 'undefined' ? true : false;
        }
    },
    onAudioControllerStartSubtitle(index) {
        let cur = this.SwapAnimIndex.indexOf(index)
        if (cur !== -1) {
            let index = cur;
            for (let i = 0; i < cur; ++i) {
                index += (this.AddAnimationCount[i] || 0);
            }
            let addCur = 0;
            let playNextAnim = (track, preIndex) => {
                ++addCur;
                if (addCur > (this.AddAnimationCount[cur] || 0)) {
                    return;
                }
                this.playAnim(preIndex + 1, (track, preIndex) => {
                    playNextAnim(track, preIndex);
                })
            }
            this.pauseAnim(index - 1);
            this.playAnim(index, (track, preIndex) => {
                playNextAnim(track, preIndex);
            })
        }
        if (this.Font[index - 1] && this.HideFont[index]) {
            this.Font[index - 1].active = false;
        }
        if (this.Font[index]) {
            this.Font[index].active = true;
        }
    },
    onAudioControllerCompleteSubtitle(index) {
        this.scheduleOnce(() => {
            if (this.Font[index] && this.HideFont[index]) {
                this.Font[index].active = false;
            }
            ++index;
            if (this.NextPlayIndex.indexOf(index) === -1) {
                this.playAudioSubtitle(index);
            }
        }, 0.7)
        if (this.AudioLength === index + 1) {
            if (this.RePlayBtn) {
                this.RePlayBtn.active = true;
            }
        }
    }
});
