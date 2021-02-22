/*!
 * [remote]事件注册及分发
 * by houzhenag
 */

class NoticeCenter {
    constructor(){
        this.handles_ = {};
    }

    dispatchEvent(eventName){
        let result = [];
        let name = eventName;
        let _leftArgs = [].splice.call(arguments, 1);

        if (eventName == 'CONTEXT_ENABLE_MAGIC') {
            console.log("[debugevent]dispatchEvent eventName outer " + eventName, this.handles_['CONTEXT_ENABLE_MAGIC'][0]);
        }
        for (let findEvenName in this.handles_) {
            if (findEvenName == eventName) {
                for (let i = this.handles_[name].length-1; i >= 0; i--) {
                    let handler = this.handles_[name][i]
                    if (handler && handler.target) {
                        if (eventName == 'CONTEXT_ENABLE_MAGIC') {
                            console.log("[debugevent]dispatchEvent eventName inner" + eventName, i);
                        }
                        let returnValue = handler.callback.apply(handler.target, _leftArgs);
                        result.push(returnValue);
                    } else {
                        console.log("[debugevent]dispatchEvent eventName but not found target" + eventName);                  
                    }
                }
            }
        }
        return result
    }

    addEvent(eventNames, callback, target){

        if (Array.isArray(eventNames) == false) {
            eventNames = [eventNames];
        }
        for (let i = 0, len = eventNames.length; i < len; i++) {
            let name = eventNames[i];
            this.handles_[name] = this.handles_[name] || [];

            this.handles_[name].push({
                callback: callback,
                target: target
            });
            if (eventNames[i] == 'CONTEXT_ENABLE_MAGIC') {
                console.log('[debugevent]addEvent eventName', eventNames[i], this.handles_[name].join(','));
            }
        }
    }

    removeEvent(eventNames, callback, target) {
        if (target == undefined) {
            target = callback;
            callback = undefined;
        }
        if (Array.isArray(eventNames) == false) {
            eventNames = [eventNames];
        }
        for (let idx in eventNames) {
            let eventName = eventNames[idx];
            if (eventName == 'CONTEXT_ENABLE_MAGIC') {
                console.log("[debugevent]try to remove eventName" + eventName, this.handles_[eventName] ? this.handles_[eventName].join(',') : 'not found');
            }
            if (this.handles_[eventName]) {
                for (let i = this.handles_[eventName].length-1; i >= 0; i--) {
                    let handler = this.handles_[eventName][i];
                    if (handler) {
                        if (eventName == 'CONTEXT_ENABLE_MAGIC') {
                            console.log("[debugevent]retry to remove eventName i", i, eventName, handler,"target:"+target, "handler.target"+handler.target, target == handler.target, callback == undefined, callback.toString() == handler.callback.toString());
                        }
                        if (handler && handler.callback && target == handler.target &&
                            (callback == undefined || callback.toString() == handler.callback.toString())) {
                            this.handles_[eventName].splice(i, 1);
                            handler.target = null;
                            if (eventName == 'CONTEXT_ENABLE_MAGIC') {
                                console.log("[debugevent]remove eventName" + eventName, i, this.handles_[eventName][i]);
                            }
                        }
                    }
                }
            }
        }
    }

    removeEventByTarget(target) {
        for(let key in this.handles_) {
            let items = this.handles_[key]
            for (let i = items.length-1; i >= 0; i--) {
                let handler = items[i];
                if (target == handler.target) {
                    this.handles_[key].splice(i, 1);
                }
            }
            if (this.handles_[key].length == 0) {
                delete this.handles_[key]
            }
        }
    }
};

module.exports = new NoticeCenter;