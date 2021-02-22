/*!
 * [widget]配图（功能和字幕插图类似，区分开是为了防止后续功能设计时耦合）
 * by houzehang
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');

cc.Class({
    extends: WidgetBase,
    properties: {
        //-- 唯一组件，隐藏ID
        compId: {
            type: cc.Integer,
            default: 0,
            override: true,
            visible: false
        },
        auxPicNodes: [cc.Node],
        hideAllAtFirst: true,
        _curIndex: -1,
    },

    onLoad() {
        //-- 具有唯一性的组件
        this._unique = true;
        this._super();
        this._init();
    },

    events() {
        return {
            [EnumCfg.EEventName.AUX_PIC_CONTROLLER_SHOW_WITH_INDEX]: this._showWithIndex,
            [EnumCfg.EEventName.AUX_PIC_CONTROLLER_SHOW_NEXT]: this._showNext,
            [EnumCfg.EEventName.AUX_PIC_CONTROLLER_HIDE_WITH_INDEX]: this._hideWithIndex,
        }
    },

    /**
     * 初始化
     * @return {[type]} [description]
     */
    _init() {
        if (this.hideAllAtFirst) {
            this.auxPicNodes.map((auxPicNode) => {
                auxPicNode && (auxPicNode.active = false);
            });
        }
    },

    /**
     * 显示配图
     * @param  {[type]} index [description]
     * @return {[type]}       [description]
     */
    _showWithIndex(index) {
        this.auxPicNodes[index] && (this.auxPicNodes[index].active = true, this._curIndex = index);
    },

    /**
     * 显示下一个配图
     * @param  {[type]} needHidePre [是否隐藏上一个]
     * @return {[type]} [description]
     */
    _showNext(needHidePre) {
        if (needHidePre) this._hideWithIndex(this._curIndex);
        this._showWithIndex(++this._curIndex);
    },

    /**
     * 隐藏配图
     * @param  {[type]} index [description]
     * @return {[type]}       [description]
     */
    _hideWithIndex(index) {
        if (index == undefined) {
            this.auxPicNodes.map((auxPicNode) => {
                if (auxPicNode) auxPicNode.active = false;
            });
        } else {
            this.auxPicNodes[index] && (this.auxPicNodes[index].active = false);
        }
    },

    onDestroy() {
        this._super();
    }
});