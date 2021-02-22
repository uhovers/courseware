class ActionUtil {
    /**
     * 显示
     */
    open(...nodes) {
        nodes = [...nodes]
        nodes.map((node) => {
            if (node) {
                if (Array.isArray(node)) {
                    node.map((_node) => {
                        _node && this.open(_node)
                    })
                } else {
                    if (node instanceof cc.Node) {
                        node.active = true
                    }
                }
            }
        })
    }
    /**
     * 隐藏
     */
    close(...nodes) {
        nodes = [...nodes]
        nodes.map((node) => {
            if (node) {
                if (Array.isArray(node)) {
                    node.map((_node) => {
                        _node && this.close(_node)
                    })
                } else {
                    if (node instanceof cc.Node) {
                        node.active = false
                    }
                }
            }
        })
    }


    show(node, time = 0.5, setopacity = true) {
        if (!node) {
            return;
        }
        // if(setopacity){
        //     node.opacity =0;
        // }
        node.active = true;
        node.opacity = 255;
        // return node.runAction(cc.fadeIn(time));
    }
    wrongAction(node, prePos, callfunc) {
        if (!node) {
            return;
        }
        node.runAction(cc.sequence(cc.sequence(cc.moveTo(0.03, prePos.x + 30, prePos.y), cc.moveTo(0.06, prePos.x - 30, prePos.y), cc.moveTo(0.03, prePos.x, prePos.y)).repeat(2), cc.callFunc(() => {
            if (typeof callfunc == "function") {
                callfunc();
            }
        })));
    }
    shakeAction(node, offset, time) {
        let x = node.x; let y = node.y;
        offset = offset || 5;
        let action = cc.repeatForever(
            cc.sequence(
                cc.moveTo(0.018, cc.v2(x + (3 + offset), y + (offset + 7))),
                cc.moveTo(0.018, cc.v2(x - (6 + offset), y + (offset + 7))),
                cc.moveTo(0.018, cc.v2(x - (13 + offset), y + (offset + 3))),
                cc.moveTo(0.018, cc.v2(x + (3 + offset), y - (6 + offset))),
                cc.moveTo(0.018, cc.v2(x - (5 + offset), y + (offset + 5))),
                cc.moveTo(0.018, cc.v2(x + (2 + offset), y - (8 + offset))),
                cc.moveTo(0.018, cc.v2(x - (8 + offset), y - (10 + offset))),
                cc.moveTo(0.018, cc.v2(x + (3 + offset), y + (offset + 10))),
                cc.moveTo(0.018, cc.v2(x + (0 + offset), y + (offset + 0)))
            )
        )
        node.runAction(action)
        node.runAction(cc.sequence(cc.delayTime(time || 0.5), cc.callFunc((ref) => {
            ref.x = x;
            ref.y = y;
            node.stopAction(action)
        })))
        return action;
    }
}
module.exports = new ActionUtil;