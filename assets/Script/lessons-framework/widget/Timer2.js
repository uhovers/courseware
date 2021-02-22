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
        TimeNode: [cc.Node],    //时间节点 
        TimeSp: [cc.SpriteFrame],
        TimeOnStart: [cc.Integer],
        TimeStatus: 0,      //0 stop  1 runing  2 pause 
        Ascending: false,
        Auto: false,
        Max: [cc.Integer],
        Min: [cc.Integer],
        _time: [cc.Integer],
        _timeDt: 0,
    },
    onLoad() {
        this._super()
        this._Radix = this.TimeSp.length
        if (this.TimeOnStart.length > 0) {
            this.setTime(this.compId, this.TimeOnStart)
        }
    },
    events() {
        return {
            [EnumCfg.EEventName.TIMER2_START]: this.startTimer,
            [EnumCfg.EEventName.TIMER2_STOP]: this.stopTimer,
            [EnumCfg.EEventName.TIMER2_PAUSE]: this.pauseTimer,
            [EnumCfg.EEventName.TIMER2_SETTIME]: this.setTime,
        }
    },
    startTimer(compId, time) {
        if (compId !== this.compId) {
            return
        }
        if (time === undefined) {
            time = this.TimeOnStart
        }
        this.setTime(this.compId, time)
        this.TimeStatus = 1
    },
    stopTimer(compId, reset, time) {
        if (compId !== this.compId) {
            return
        }
        if (reset) {
            if (typeof time === undefined) {
                time = this.TimeOnStart
            }
            this.setTime(compId, time)
        }
        this.TimeStatus = 0
    },
    setTime(compId, timeArray) {
        if (compId !== this.compId) {
            return
        }
        this._time = timeArray
        this.TimeNode.forEach((element, index) => {
            element.getComponent(cc.Sprite).spriteFrame = this.TimeSp[this._time[index]] || this.TimeSp[0]
        })
    },
    update(dt) {
        if (this.Auto && this.TimeStatus === 1) {
            this._timeDt += dt;
            if (this._timeDt >= 1.0) {
                this._timeDt -= 1
                let temp_time_num = 0
                let _time_temp = this._time.concat().reverse()
                _time_temp.forEach((element, index) => {
                    temp_time_num += element * Math.pow(this._Radix, index);
                })
                if (this.Ascending) {
                    temp_time_num += 1;
                } else {
                    temp_time_num -= 1;
                }
                if (this.Max.length !== 0) {
                    let temp_max = 0
                    this.Max.concat().reverse().forEach((element, index) => {
                        temp_max += element * Math.pow(this._Radix, index)
                    })
                    if (temp_time_num >= temp_max) {
                        temp_time_num = temp_max
                        if (this.Ascending === true) {
                            this.stopTimer(this.compId);
                        }
                    }
                }
                if (this.Min.length !== 0) {
                    let temp_min = 0
                    this.Min.concat().reverse().forEach((element, index) => {
                        temp_min += element * Math.pow(this._Radix, index)
                    })
                    if (temp_time_num <= temp_min) {
                        temp_time_num = temp_min
                        if (this.Ascending === false) {
                            this.stopTimer(this.compId);
                        }
                    }
                }
                for (let i = 0, length = _time_temp.length; i < length; ++i) {
                    _time_temp[i] = temp_time_num % this._Radix || 0
                    temp_time_num = Math.floor(temp_time_num / this._Radix)
                }
                this._time = _time_temp.reverse()
                this.notice(EnumCfg.EEventName.ON_TIMER2_TIME_UPDATE, this._time, this._Radix)
                this.setTime(this.compId, this._time)
            }
        }
    }
});
