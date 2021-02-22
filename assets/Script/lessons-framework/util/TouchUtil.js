/**
 * 触摸相关事件绑定操作
 * @type {[type]}
 */
let NoticeCenter = require('./../core/NoticeCenter');
let EnumCfg = require('./../config/EnumCfg');

let TouchUtil = {
    ClickWithFunc: [],
    ClickUseShowSort: true, // 层级顺序 触发回调
    NodeWithFunc: [],
    MoveUseShowSort: true,
    _enableMagic: false,
    _isTeacher: false,
    init: () => {
        //-- 初始化条件
        let curScene = cc.director.getScene();
        if (!curScene || curScene.__bindTouchUtil__) {
            // console.log('MINGXI_DEBUG_LOG>>>>>>>>>touchdebuger already bind abort',!!curScene);
            return
        };

        //-- 初始化过程
        curScene.__bindTouchUtil__ = true;
        TouchUtil.ClickWithFunc = [];
        TouchUtil.ClickUseShowSort = true; // 层级顺序 触发回调
        TouchUtil.NodeWithFunc = [];
        TouchUtil.MoveUseShowSort = true;
        TouchUtil._init_ = false;

        let TOUCH_NODE_DELEGATE = "TOUCH_NODE_DELEGATE"
        let canvas              = curScene;
        let touchDeleage        = canvas.getChildByName(TOUCH_NODE_DELEGATE);
        if (touchDeleage) {
            touchDeleage.removeFromParent()
            touchDeleage.destroy();
        }

        let node = new cc.Node;
        canvas.addChild(node);
        node.setLocalZOrder(100)
        node.setName(TOUCH_NODE_DELEGATE)

        TouchUtil._enableMagic = false;
        TouchUtil._isTeacher = false;
        TouchUtil.tag = 0;
        cc.director.getScene().on("ENABLE_MAGIC", () => {
            TouchUtil._enableMagic = true;
        })
        cc.director.getScene().on("DISABLE_MAGIC", () => {
            TouchUtil._enableMagic = false;
        })
        cc.director.getScene().on("MOUNTED", (event) => {
            let context = event.detail.context
            TouchUtil._isTeacher = context && context.users && context.users.master;
        })

        node.x = 0;
        node.y = 0;
        node.anchorX = 0
        node.anchorY = 0
        node.width  = cc.winSize.width;
        node.height = cc.winSize.height;
        node.zIndex = 1;

        let touch_start;
        let move_node_array = [];
        let click_node_array = [];

        node.on(cc.Node.EventType.TOUCH_START, (event) => {
            // console.log('MINGXI_DEBUG_LOG>>>>>>>>>touchdebuger touchstart',move_node_array.length);
            if (move_node_array.length > 0) {
                return;
            }
            touch_start = event.getLocation();
            click_node_array = [];
            for (let i = 0, clickWithFunc = null; clickWithFunc = TouchUtil.ClickWithFunc[i]; ++i) {
                if (cc.isValid(clickWithFunc.btn, true) && clickWithFunc.btn.activeInHierarchy && TouchUtil.checkTouch(clickWithFunc.btn, touch_start)) {
                    if (!~click_node_array.indexOf(clickWithFunc)) {
                        click_node_array.push(clickWithFunc);
                    }
                }
            }
            move_node_array = [];
            for (let i = 0, nodeWithFunc = null; nodeWithFunc = TouchUtil.NodeWithFunc[i]; ++i) {
                if (cc.isValid(nodeWithFunc.node, true) && nodeWithFunc.node.activeInHierarchy && TouchUtil.checkTouch(nodeWithFunc.node, touch_start)) {
                    if (!~move_node_array.indexOf(nodeWithFunc)) {
                        move_node_array.push(nodeWithFunc);
                    }
                }
            }
            move_node_array = TouchUtil.nodeSort(move_node_array, TouchUtil.MoveUseShowSort);
            for (let i = 0, nodeWithFunc; nodeWithFunc = move_node_array[i]; ++i) {
                NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_STOP_ONCE, true);
                // console.log('MINGXI_DEBUG_LOG>>>>>>>>>touchdebuger nodeWithFunc.start',nodeWithFunc.start);
                if (nodeWithFunc.start) {
                    if (nodeWithFunc.start(event)) {
                        // console.log('MINGXI_DEBUG_LOG>>>>>>>>>touchdebuger start~~','');
                        move_node_array.splice(i + 1, move_node_array.length - i);
                    }
                    if (nodeWithFunc.node.valid) {//不触发 move  end cancel
                        move_node_array.splice(i, 1);
                        nodeWithFunc.node.valid = false;
                    }
                }
            }
        })
        node.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            for (let i = 0, nodeWithFunc; nodeWithFunc = move_node_array[i]; ++i) {
                if (nodeWithFunc.move) {
                    nodeWithFunc.move(event);
                }
            }
        })
        node.on(cc.Node.EventType.TOUCH_END, (event) => {
            for (let i = 0, nodeWithFunc; nodeWithFunc = move_node_array[i]; ++i) {
                if (nodeWithFunc.end) {
                    nodeWithFunc.end(event);
                }
            }
            move_node_array = [];
            if (cc.pDistance(event.getLocation(), cc.v2(touch_start)) > 30) {
                click_node_array = [];
                return;
            }
            //排序
            click_node_array = TouchUtil.nodeSort(click_node_array, TouchUtil.ClickUseShowSort);
            for (let i = 0, clickWithFunc = null; clickWithFunc = click_node_array[i]; ++i) {
                if ((cc.isValid(clickWithFunc.btn, true) && clickWithFunc.btn.activeInHierarchy && TouchUtil.checkTouch(clickWithFunc.btn, event.getLocation()))) {
                    if (clickWithFunc.func) {
                        if (clickWithFunc.btn.isOnlyTeacherUse && TouchUtil._enableMagic) {
                            continue;
                        }
                        if (clickWithFunc.func(event)) {
                            return;
                        }
                        if (clickWithFunc.btn.getComponent(cc.Button)) { //button 吞噬
                            return;
                        }
                    }
                }
            }
        })
        node.on(cc.Node.EventType.TOUCH_CANCEL, (event) => {
            for (let i = 0, nodeWithFunc; nodeWithFunc = move_node_array[i]; ++i) {
                if (nodeWithFunc.cancel) {
                    nodeWithFunc.cancel(event);
                }
            }
            move_node_array = [];
            click_node_array = [];
        })
        node._touchListener.setSwallowTouches(false);
    },
    checkTouch(node, worldPos) {
        if (node.name.includes('useCollider') && node.getComponent(cc.PolygonCollider)) {
            let com = node.getComponent(cc.PolygonCollider);
            worldPos = node.convertToNodeSpaceAR(worldPos)
            if (cc.Intersection.pointInPolygon(worldPos, com.points)) {
                return true;
            }
            return false;
        }
        if (node.getBoundingBox().contains(node.parent.convertToNodeSpaceAR(worldPos))) {
            return true;
        }
        let children = node.children;
        for (let i = 0; i < children.length; ++i) {
            if (children[i].name.includes('addBox')) {
                if (children[i].getBoundingBox().contains(children[i].parent.convertToNodeSpaceAR(worldPos))) {
                    return true;
                }
            }
        }
        return false;
    },
    nodeSort: (nodeArray, UseShowSort) => {
        TouchUtil.init();
        nodeArray.sort((nodeA, nodeB) => {
            let tag1 = nodeA.tag;
            let tag2 = nodeB.tag;
            nodeA = nodeA.node || nodeA.btn;
            nodeB = nodeB.node || nodeB.btn;
            if (nodeA === nodeB) {
                return tag1 - tag2;
            } else if (nodeA.sort == nodeB.sort) {
                if (UseShowSort) {
                    let sortA = TouchUtil.getNodeShowOrder(nodeA);
                    let sortB = TouchUtil.getNodeShowOrder(nodeB);
                    let sort_a = 0;
                    let sort_b = 0;
                    while (true) {
                        sort_a = sortA.pop();
                        sort_b = sortB.pop();
                        if (sort_a === undefined) {
                            sort_a = Math.min(-10000, sort_b - 1);
                        } else if (sort_b === undefined) {
                            sort_b = Math.min(-10000, sort_a - 1);
                        }
                        if (sort_a !== sort_b) {
                            return sort_a > sort_b ? -1 : 1;
                        }
                    }
                } else {
                    return tag1 - tag2;
                }
            } else {
                return nodeA.sort > nodeB.sort ? -1 : 1;
            }
        })
        return nodeArray;
    },
    getNodeShowOrder: (node) => {
        TouchUtil.init();
        let nodeShowOrder = [];
        let children;
        let Canvas = cc.find("Canvas");
        let __getNodeShowOrder = (node) => {
            if (node != Canvas) {
                if (node && node.parent) {
                    children = node.parent.children;
                    nodeShowOrder.push(children.indexOf(node));
                    __getNodeShowOrder(node.parent);
                }
            }
        }
        __getNodeShowOrder(node);
        return nodeShowOrder;
    },
    addClickBtn: (btn, callfunc, sort) => {
        if (!btn || !callfunc) {
            return;
        }
        if (btn instanceof Array) {
            if (!(sort instanceof Array)) {
                sort = [sort];
            }
            for (let i = 0, node = null; node = btn[i]; ++i) {
                TouchUtil.addClickBtn(node, callfunc, sort[i]);
            }
        } else {
            if (sort instanceof Array) {
                sort = sort[0];
            }
            btn.sort = sort || btn.sort || 0;
            // console.log('MINGXI_DEBUG_LOG>>>>>>>>>touchdebuger push');
            TouchUtil.ClickWithFunc.push({
                btn: btn,
                func: callfunc,
                tag: TouchUtil.tag++,
            });
        }
    },
    removeClickBtn: (btn, callfunc) => {
        TouchUtil.init();
        if (!btn) {
            return;
        }
        if (btn instanceof Array) {
            for (let i = 0, node = null; node = btn[i]; ++i) {
                TouchUtil.removeClickBtn(node, callfunc);
            }
        } else {
            for (let i = 0, clickWithFunc; clickWithFunc = TouchUtil.ClickWithFunc[i];) {
                if (clickWithFunc.btn == btn && (!callfunc || callfunc == clickWithFunc.func)) {
                    TouchUtil.ClickWithFunc.splice(i, 1);
                } else {
                    ++i;
                }
            }
        }
    },
    addMoveNode: (node, startFunc, moveFunc, endFunc, cancelFunc, sort) => {
        TouchUtil.init();
        if (!node) {
            return;
        }
        if (node instanceof Array) {
            if (!(sort instanceof Array)) {
                sort = [sort];
            }
            for (let i = 0, nodeTemp = null; nodeTemp = node[i]; ++i) {
                TouchUtil.addMoveNode(nodeTemp, startFunc, moveFunc, endFunc, cancelFunc, sort[i]);
            }
        } else {
            if (sort instanceof Array) {
                sort = sort[0];
            }
            node.sort = sort || node.sort || 0;
            TouchUtil.NodeWithFunc.push({
                node: node,
                start: startFunc,
                move: moveFunc,
                end: endFunc,
                cancel: cancelFunc,
                tag: TouchUtil.tag++
            });
        }
    },
    removeMoveNode: (node, startFunc, moveFunc, endFunc, cancelFunc) => {
        TouchUtil.init();
        if (!node) {
            return;
        }
        if (node instanceof Array) {
            for (let i = 0, nodeTemp; nodeTemp = node[i]; ++i) {
                TouchUtil.removeMoveNode(nodeTemp, startFunc, moveFunc, endFunc);
            }
        } else {
            for (let i = 0, nodeWithFunc; nodeWithFunc = TouchUtil.NodeWithFunc[i]; ++i) {
                if (nodeWithFunc.node == node) {
                    if (startFunc && startFunc != TouchUtil.nodeWithFunc[i].start) {
                        continue;
                    }
                    if (moveFunc && moveFunc != TouchUtil.nodeWithFunc[i].move) {
                        continue;
                    }
                    if (endFunc && endFunc != TouchUtil.nodeWithFunc[i].end) {
                        continue;
                    }
                    if (cancelFunc && cancelFunc != TouchUtil.nodeWithFunc[i].cancel) {
                        continue;
                    }
                    TouchUtil.NodeWithFunc.splice(i, 1);
                    --i;
                }
            }
        }
    },
}

module.exports = {
    addClickBtn: function () {
        TouchUtil.init();
        TouchUtil.addClickBtn(...arguments)
    },
    addMoveNode: function () {
        TouchUtil.init();
        TouchUtil.addMoveNode(...arguments)
    },
    removeClickBtn: function () {
        TouchUtil.init();
        TouchUtil.removeClickBtn(...arguments)
    },
    removeMoveNode: function () {
        TouchUtil.init();
        TouchUtil.removeMoveNode(...arguments)
    },
}