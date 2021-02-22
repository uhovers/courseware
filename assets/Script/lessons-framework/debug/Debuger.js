/*!
 * [remote]Debug
 * by houzhenag
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');
let TouchUtil = require('./../util/TouchUtil');
let NoticeCenter = require('./../core/NoticeCenter');


let _DEBUGMODEL_ = 1;

cc.Class({
    extends: WidgetBase,
    properties: {
    },

    onLoad() {
        this._super();
        if (!window.ONLINE) {
            this._init();
        }
    },

    _init() {
        this.createButton('给出魔法棒', cc.p(-200, 500), () => {
            NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_ENABLE_MAGIC, true);
            return true;
        })
        this.createButton('收回魔法棒', cc.p(200, 500), () => {
            NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_ENABLE_MAGIC, false);
            return true;
        })
    },

    createButton(labelText, pos, clickFunc) {
        let curScene = cc.director.getScene();
        let button = new cc.Node();
        let label = button.addComponent(cc.Label);
        label.string = labelText;
        label.fontSize = 50;
        label.lineHeight = 50;
        button.x = pos.x;
        button.y = pos.y;
        button.color = cc.color(0, 0, 0);
        curScene.getChildByName('Canvas').addChild(button, 100);
        TouchUtil.addClickBtn(button, clickFunc);
        // button.on(cc.Node.EventType.TOUCH_START, (event) => {
        //     clickFunc && typeof clickFunc === 'function' && clickFunc();
        // });
        // button._touchListener.setSwallowTouches(true);
        // this._buttons.push(button);
    },

    // onDestroy() {
    //     this._super();
    //     for (var i = this._buttons.length - 1; i >= 0; i--) {
    //         if (this._buttons[i]) this._buttons[i].removeFromParent(true);
    //         this._buttons.splice(i, 1);
    //     }
    //     this._buttons = null;
    // }
});