let {
    LogicBase,
    ActionUtil,
    EnumCfg,
    TouchUtil
} = require('./lessons-framework/importer');

cc.Class({
    extends: LogicBase,
    properties: {
        btn1Answer: [cc.Node],
        answer1: [cc.Node],

        btn2Answer: [cc.Node],
        answer2: [cc.Node],
       
        btn3Answer: [cc.Node],
        answer3: [cc.Node],
    },
    
    onLoad() {
        this._super();
        for (let i = 0; i < 3; i++) {
            if (this.answer1[i]) this.answer1[i].active = false;
            if (this.answer2[i]) this.answer2[i].active = false;
            if (this.answer3[i]) this.answer3[i].active = false;
        }

        this.btn1Answer.forEach((btn, idx) => {
            if (btn) {
                TouchUtil.addClickBtn(btn, ()=>{
                    if (this.answer1[idx]) {
                        console.log('选择正确');
                        this.answer1[idx].active = true;
                    } else {
                        console.log('选择错误');
                    }
                })
            }
        });

        // this.btn2Answer.forEach((btn, idx) => {
        //     if (btn) {
        //         TouchUtil.addClickBtn(btn, ()=>{
        //             if (this.answer2[idx]) {
        //                 console.log('选择正确');
        //                 this.answer2[idx].active = true;
        //             } else {
        //                 console.log('选择错误');
        //             }
        //         })
        //     }
        // });

        // this.btn3Answer.forEach((btn, idx) => {
        //     if (btn) {
        //         TouchUtil.addClickBtn(btn, ()=>{
        //             if (this.answer3[idx]) {
        //                 console.log('选择正确');
        //                 this.answer3[idx].active = true;
        //             } else {
        //                 console.log('选择错误');
        //             }
        //         })
        //     }
        // });
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