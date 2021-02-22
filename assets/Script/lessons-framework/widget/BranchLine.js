// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
let {
    WidgetBase,
    EnumCfg,
    DraftCfg,
    NoticeCenter,
    LogicBase,
    TouchUtil,
    AudioUtil,
    AnimUtil,
    ActionUtil,
} = require('../importer');
cc.Class({
    extends: LogicBase,

    properties: {
        m_branch_layer: cc.Node,
        m_back_btn: cc.Node,
        m_swall_layer: cc.Node,
        m_show_btn: cc.Node,
        _magic_enable: false,
        _teacher: false
    },

    onLoad() {
        this._super();
        TouchUtil.addClickBtn(this.m_swall_layer, () => {
            return true
        })
        TouchUtil.addMoveNode(this.m_swall_layer, () => {
            return true;
        })
        TouchUtil.addClickBtn(this.m_show_btn, () => {
            if (this._magic_enable === true) {
                return
            }
            this.playAudioClick()
            this.m_branch_layer.active = true
            return true
        })
        TouchUtil.addClickBtn(this.m_back_btn, () => {
            if (this._magic_enable) {
                return
            }
            if (this.m_branch_layer) this.m_branch_layer.active = false;
            return true
        })
    },
    onContextMagicEnabledChanged(enable, teacher) {
        this._magic_enable = enable
        this._teacher = teacher
    },
    onContextTransferMounted(context, students, users) {
        this._teacher = context && context.users && context.users.master
        if (!this._teacher && window.ONLINE) {
            this.m_back_btn.opacity = 0
        }
    }
});
