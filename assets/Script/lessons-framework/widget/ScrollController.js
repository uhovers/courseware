/**
 * 绑定到ScrollView上
 * by houzehang
 */

let EnumCfg = require('./../config/EnumCfg');
let TouchUtil = require('./../util/TouchUtil');
let WidgetBase = require('./../basement/WidgetBase');

cc.Class({
    extends: WidgetBase,

    properties: {

    },

    onLoad() { },

    start() {
        let node = new cc.Node;
        node.x = this.node.x;
        node.y = this.node.y;
        node.anchorX = this.node.anchorX;
        node.anchorY = this.node.anchorY;
        node.width = this.node.width;
        node.height = this.node.height;
        node.parent = this.node.parent;
        node.zIndex = this.node.zIndex + 1;
        node.on(cc.Node.EventType.MOUSE_WHEEL, (event) => {
            event.stopPropagation();
        })
        TouchUtil.addMoveNode(node, () => {
        });
    }
});