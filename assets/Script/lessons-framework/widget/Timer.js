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
    extends: WidgetBase,

    properties: {
        NumberSp: [cc.SpriteFrame],
        NumberNode: cc.Node,
        StartNum: 0,
        EndNum: 0,
        _IsUp: true,
        _isPlayIng: false,
        _time: 0.0,
        isPlayIng: {
            set(value) {
                this._isPlayIng = value;
                this.notice(EnumCfg.EEventName.ON_TIMER_CHANGEPLAYING, value);
            },
            get() {
                return this._isPlayIng;
            }
        },
    },
    start() {
        this._IsUp = this.StartNum < this.EndNum;
        this._time = this.StartNum;
    },
    events() {
        return {
            [EnumCfg.EEventName.TIMER_START]: this.startTimer,
            [EnumCfg.EEventName.TIMER_STOP]: this.stopTimer,
            [EnumCfg.EEventName.TIMER_PAUSE]: this.pauseTimer,
        }
    },
    startTimer(time) {
        this.isPlayIng = true;
        this._time = time === undefined ? this.StartNum : time;
        this.notice(EnumCfg.EEventName.ON_TIMER_START);
    },
    stopTimer() {
        this.isPlayIng = false;
        this._time = this.StartNum;
        this.notice(EnumCfg.EEventName.ON_TIMER_STOP);
    },
    pauseTimer() {
        this.isPlayIng = false;
        this.notice(EnumCfg.EEventName.ON_TIMER_PAUSE);
    },
    update(dt) {
        if (!this._isPlayIng) {
            return;
        }
        let _time;
        if (this.isPlayIng) {
            if (this._IsUp) {
                this._time += dt;
                _time = Math.floor(this._time);
            } else {
                this._time -= dt;
                _time = Math.ceil(this._time)
            }
        }
        if (this.NumberSp[_time]) {
            this.NumberNode.getComponent(cc.Sprite).spriteFrame = this.NumberSp[_time];
        }
        if (_time === this.EndNum) {
            this.pauseTimer();
        }
    }
});
