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
    extends: LogicBase,

    properties: {
        AnimComId: 0,
        SettlePanel: cc.Node,
        ReShowSettlePanel: false,
        AudioIndex: [cc.Integer],
        AnimIndex: [cc.Integer],
        IsPic: false,
        Pic: [cc.Node],
        _hasSettle: null,
        delayShowTime: 0,
        HasFaild: true,
        ComtrollerNode: cc.Node,
        _magicEnable: false
    },
    start() {
        cc.director.getScene().on('resetSettlePanel', (context) => {
            this._hasSettle = null;
        })
        for (let i = 0; i < 2; ++i) {
            if (this.AnimIndex[i] === undefined) {
                this.AnimIndex[i] = i;
            }
            if (this.AudioIndex[i] === undefined) {
                this.AudioIndex[i] = i;
            }
        }
    },
    onUpdateProgress(value) {
        if (!cc.isValid(this) || !this.node.activeInHierarchy || (this.ComtrollerNode && this.ComtrollerNode.activeInHierarchy)) {
            return;
        }
        if (value === 100 && this._hasSettle === null) {
            this._hasSettle = true;
            if (this.IsPic) {
                this.SettlePanel.active = true;
                if (this.Pic[1]) this.Pic[1].active = false;
                if (this.Pic[0]) this.Pic[0].active = true;
                this.scheduleOnce(() => {
                    this.SettlePanel.active = false;
                }, 2)
            } else {
                this.scheduleOnce(() => {
                    this.SettlePanel.active = true;
                    this.playAnim(this.AnimComId, this.AnimIndex[0]);
                    this.playAudioSubtitle(this.AudioIndex[0])
                }, this.delayShowTime);
            }
        }
    },
    onContextMagicEnabledChanged(enable, isteacher) {
        this._magicEnable = enable
        if (!cc.isValid(this) || !this.node.activeInHierarchy || (this.ComtrollerNode && this.ComtrollerNode.activeInHierarchy)) {
            return;
        }
        if (enable === false && this._hasSettle === null && !isteacher) {
            if ((this.IsPic && !this.Pic[1]) || this.HasFaild === false) {
                return;
            }
            this._hasSettle = false;
            this.SettlePanel.active = true;
            if (this.IsPic) {
                if (this.Pic[0]) this.Pic[0].active = false;
                if (this.Pic[1]) this.Pic[1].active = true;
                this.scheduleOnce(() => {
                    this.SettlePanel.active = false;
                }, 2)

            } else {
                this.playAnim(this.AnimComId, this.AnimIndex[1]);
                this.playAudioSubtitle(this.AudioIndex[1])
            }

        } else if (enable === true && this.ReShowSettlePanel === true) {
            this._hasSettle = null;
        }
    },
    onAnimControllerComplete(comId, index) {
        if (!cc.isValid(this) || !this.node.activeInHierarchy || (this.ComtrollerNode && this.ComtrollerNode.activeInHierarchy)) {
            return;
        }
        if (comId !== this.AnimComId || this.AnimIndex.indexOf(index) === -1) {
            return;
        }
        this.SettlePanel.active = false;
    }
});
