let {
    LogicBase,
    ActionUtil,
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
        let data = [];
        let self = this;
        cc.loader.loadResDir("uuid",cc.SpriteFrame, function (err, assets) {
            self.sortNameIndex(assets)
            assets.forEach((element, index) => {
                let temp = {
                    "__uuid__": element._uuid
                }  
                data.push(temp); 
            });
        });
        this.setTimeout(()=>{
            console.log('YOUSHI_DEBUG===============',JSON.stringify(data));
        }, 5000)
    },
    sortNameIndex(arr){
        arr.sort((pre, next) => {
            // return pre.id - next.id;
            let index_pre = /\d+$/.exec(pre._name);
            let index_next = /\d+$/.exec(next._name);
            return index_pre - index_next;
        })
    },
    /**
     * 动画结束时
     */
    onDestroy() {
        this._super();
    },
});