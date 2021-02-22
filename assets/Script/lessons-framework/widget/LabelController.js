/*!
 * [widget]与bmfont同理
 * by houzehang
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');

cc.Class({
    extends: WidgetBase,
    properties: {
        charFrames: [cc.SpriteFrame],
        chars     : [cc.String],
        offsetY   : [cc.Float],
        space     : 0,
        scale     : 1,
        align     : {
            default: EnumCfg.EETextAlignStyle.CENTER,
            type: cc.Enum(EnumCfg.EETextAlignStyle),
            visible() {
                return true;
            },
        },
        _totalWidth: 0
    },

    onLoad() {
        this._super();
        this.node.anchorX = 0;
        this._orginX      = this.node.x;
        this._charNodes   = []
    },

    events() {
        return {
            [EnumCfg.EEventName.LABEL_CONTROLLER_SET_STRING]: this._setString,
        }
    },

    start() {
        this._init();
    },

    _reset(compId){
        if (compId !== null && compId != this.compId) return;
        
    },
    
    _getCharNode(index){
        if (this._charNodes[index]) {
            return this._charNodes[index]
        }
        let node = new cc.Node();
        node.addComponent(cc.Sprite)
        this._charNodes[index] = node
        return node;
    },

    _createChar(index, posIndex){
        if (!this.charFrames[index]) {
            return
        };

        let charNode = this._getCharNode(posIndex);
        if (charNode) {
            charNode.getComponent(cc.Sprite).spriteFrame = this.charFrames[index];
            charNode.parent  = this.node;
            charNode.x       = this._totalWidth
            charNode.y       = this.offsetY[index] || 0
            charNode.anchorX = 0
            charNode.active  = true
            charNode.scale   = this.scale
            this._totalWidth += (charNode.width * this.scale + this.space); 
            if (this.align == EnumCfg.EETextAlignStyle.LEFT) {
                // 默认
            }else if (this.align == EnumCfg.EETextAlignStyle.CENTER) {
                this.node.x = this._orginX - this._totalWidth / 2
            }else if (this.align == EnumCfg.EETextAlignStyle.RIGHT) {
                this.node.x = this._orginX - this._totalWidth
            }
        }
    },

    _empty(){
        this._charNodes.map((charNode)=>{
            if (charNode) {
                charNode.active = false
            }
        })
        this._totalWidth = 0;
    },

    _setString(compId, string) {
        if (arguments.length == 1) {
            string = compId;
            compId = 0;
        }
        if (compId !== null && compId != this.compId) return;
        if (typeof string != 'number' && typeof string != 'string') {
            console.log('invalid args,string:',string)
            return
        }
        this._empty(compId)
        let chars = string.toString().split('');
        let posIndex = 0;
        chars.map((char)=>{
            let charIndex = this.chars.indexOf(char)
            if (charIndex > -1) {
                this._createChar(charIndex, posIndex++)
            }
        })
    },

    /**
     * 初始化
     * @return {[type]} [description]
     */
    _init() {
    },

    onDestroy() {
        this._super();
    }
});