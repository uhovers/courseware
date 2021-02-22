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
        let ctrl = this.node.getComponent("AudioController")
        let str = []
        ctrl.subtitleAudios.map((audio, index)=>{
            let audioId = cc.audioEngine.play(audio, false);
            str.push(cc.audioEngine.getDuration(audioId).toFixed(2) * 1)
            cc.audioEngine.getDuration(audio)
        })

        console.log(' MING XI ====================  test   end' , str  );
    },
    
    /**
     * 动画结束时
     */
    onDestroy() {
        this._super();
    },
});