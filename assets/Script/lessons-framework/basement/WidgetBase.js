/**
 * 组件基类
 * by houzehang
 */
let NoticeCenter = require('./../core/NoticeCenter');

module.exports = cc.Class({
    extends: cc.Component,

    properties: {
        //-- 组件ID
        compId: 0,
        //-- 组件是否具有唯一性
        _unique: false,
        //-- 定时器ID记录容器
        _timerIdArrForTimeout: [],
        _timerIdArrForInterval: [],
    },

    onLoad() {
        if (this.events) {
            this._eventHash = this.events();
            if (this._eventHash) {
                for (let eventName in this._eventHash) {
                    let eventFunc = this._eventHash[eventName];
                    eventFunc && (NoticeCenter.removeEvent(eventName, this._eventHash[eventName], this), NoticeCenter.addEvent(eventName, this._eventHash[eventName], this))
                }
            }
        }
    },

    /**
     * 对外通知自身的状态
     * 说明1：仅限于本组件对外发出的通知使用，如通知其他组件干某事，请直接使用NoticeCenter.dispatchEvent
     * 说明2：唯一性组件无需并入组件ID(compId)
     * @param  {[type]} eventName [description]
     * @return {[type]}           [description]
     */
    notice(eventName) {
        if (eventName) {
            if (this._unique) {
                return NoticeCenter.dispatchEvent(eventName, ...[].splice.call(arguments, 1));
            } else {
                return NoticeCenter.dispatchEvent(eventName, this.compId, ...[].splice.call(arguments, 1));
            }
        }
    },

    /**
     * 重写以防止场景销毁时定时器继续执行
     * @param {[type]} callfunc [description]
     * @param {[type]} delay    [description]
     */
    setTimeout(callfunc, delay) {
        let timerId = setTimeout(callfunc, delay);
        this._timerIdArrForTimeout.push(timerId);
        return timerId;
    },

    /**
     * 重写以防止场景销毁时定时器继续执行
     * @param {[type]} callfunc [description]
     * @param {[type]} delay    [description]
     */
    setInterval(callfunc, interval) {
        let timerId = setInterval(callfunc, interval);
        this._timerIdArrForInterval.push(timerId);
        return timerId;
    },

    onDestroy() {
        //-- 销毁监听
        NoticeCenter.removeEventByTarget(this)
        //-- 要确保组件销毁时,定时器跟随销毁
        this._timerIdArrForTimeout.map((timerId) => {
            if (timerId != undefined) {
                clearTimeout(timerId);
            }
        });
        this._timerIdArrForInterval.map((timerId) => {
            if (timerId != undefined) {
                clearInterval(timerId);
            }
        });
    }
});