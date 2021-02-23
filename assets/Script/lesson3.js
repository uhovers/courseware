let {
    LogicBase,
    ActionUtil,
    EnumCfg,
    TouchUtil
} = require('./lessons-framework/importer');

cc.Class({
    extends: LogicBase,
    properties: {
       
    },
    onLoad() {
        this._super();
        
    },
    start() {    
      
    },
    onAnimControllerStart(compId, index){
        if(index == 0) {
            this.startClickAppear();
        }
    },
    /**
     * 动画结束时
     */
    onDestroy() {
        this._super();
    },
});