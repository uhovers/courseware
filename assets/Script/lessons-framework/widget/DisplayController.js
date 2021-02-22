/**
 * 绑定到UI控件上，控制在屏幕中的相对位置
 * by houzehang
 */
cc.Class({
    extends: cc.Component,

    properties: {
        top: {
            default: 30,
            type: cc.Integer
        },
        bottom: -1,
        left: -1,
        right: -1,
    },

    onLoad() {},

    start() {
        let winVisibleSize = cc.view.getVisibleSize();
        let orgPos = this.node.getPosition();
        let finalX = orgPos.x,
            finalY = orgPos.y;

        if (this.top > -1) {
            finalY = winVisibleSize.height / 2 - this.top;
        }
        if (this.bottom > -1) {
            finalY = -winVisibleSize.height / 2 + this.bottom;
        }
        if (this.left > -1) {
            finalX = -winVisibleSize.width / 2 + this.left;
        }
        if (this.right > -1) {
            finalX = winVisibleSize.width / 2 + this.right;
        }
        this.node.anchorY = 1;
        this.node.setPosition(cc.p(finalX, finalY));
        let children = this.node.getChildren() || [];
        children.map((child) => {
            if (child) {
                child.y = child.y - this.node.height / 2;
            }
        });
    }
});