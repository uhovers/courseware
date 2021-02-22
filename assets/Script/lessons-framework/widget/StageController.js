/*!
 * [widget]舞台控件
 * by houzehang
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');

cc.Class({
    extends: WidgetBase,

    properties: {
        //-- 舞台列表
        stageNodes: [cc.Node],
        //-- 当前舞台Id
        curStageId: 0,
        //-- 无需组件ID
        compId: {
            type: cc.Integer,
            default: 0,
            override: true,
            visible: false
        },
        //-- 上一个舞台Id,辅助返回
        _preStageId: -1
    },

    onLoad() {
        this._super();
        this._unique = true;
    },

    start() {
        this.stageNodes.map((stageNode, idx) => {
            if (stageNode) stageNode.active = idx == this.curStageId;
        });
    },

    events() {
        return {
            [EnumCfg.EEventName.STAGE_CONTROLLER_SWITCH_STAGE_TO]: this._switchToStage,
            [EnumCfg.EEventName.STAGE_CONTROLLER_GOBACK]: this._goBack,
            [EnumCfg.EEventName.STAGE_CONTROLLER_NEXT]: this._next,
        }
    },

    /**
     * 切换到指定舞台
     * @param  {[type]} index [description]
     * @return {[type]}        [description]
     */
    _switchToStage(index) {
        this._preStageId = this.curStageId;
        this.stageNodes.map((stageNode, idx) => {
            if (stageNode) stageNode.active = idx == index;
        });
        this.curStageId = index;
        this.notice(EnumCfg.EEventName.ON_STAGE_CONTROLLER_SWITCH_TO, index);
    },

    /**
     * 切到下一个舞台
     * @return {[type]} [description]
     */
    _next() {
        this._switchToStage(this.curStageId + 1);
    },

    /**
     * 返回到上一个舞台
     * @return {[type]} [description]
     */
    _goBack() {
        this._switchToStage(this._preStageId);
    },

    onDestroy() {
        this._super();
    }
});