// ShaderUtils.js

// example   ShaderUtil.setShader(node.getComponent(sp.Skeleton), "gray")
//			 ShaderUtil.setShader(node.getComponent(cc.Sprite), "gray")
var ShaderUtils = {
	shaderPrograms: {},
	setShader: function (node, shaderName = 'gray') {
		let component = node.getComponent(cc.Sprite) || node.getComponent(sp.Skeleton);
		var glProgram = this.shaderPrograms[shaderName];
		if (!glProgram) {
			glProgram = new cc.GLProgram();
			let _shader = shader[shaderName];
			if (_shader) {
				const vert = _shader['vert'];
				const frag = _shader['frag'];
				glProgram.initWithString(vert, frag);
				if (!cc.sys.isNative) {
					glProgram.initWithVertexShaderByteArray(vert, frag);
					glProgram.addAttribute(cc.macro.ATTRIBUTE_NAME_POSITION, cc.macro.VERTEX_ATTRIB_POSITION);
					glProgram.addAttribute(cc.macro.ATTRIBUTE_NAME_COLOR, cc.macro.VERTEX_ATTRIB_COLOR);
					glProgram.addAttribute(cc.macro.ATTRIBUTE_NAME_TEX_COORD, cc.macro.VERTEX_ATTRIB_TEX_COORDS);
				}
				glProgram.link();
				glProgram.updateUniforms();
				this.shaderPrograms[shaderName] = glProgram;
			}
		}
		let oldShaderProgram = null;
		if (glProgram && component) {
			oldShaderProgram = component._sgNode.getShaderProgram();
			component._sgNode.setShaderProgram(glProgram);
		}
		return [oldShaderProgram, glProgram];
	},
};
const shader = {
	gray: {
		vert: `
			attribute vec4 a_position;
			attribute vec2 a_texCoord;
			attribute vec4 a_color;
			varying vec4 v_fragmentColor; 
			varying vec2 v_texCoord; 
			void main() 
			{ 
				gl_Position = CC_PMatrix * a_position;
				v_fragmentColor = a_color; 
				v_texCoord = a_texCoord; 
			}
		`,
		frag: `
			#ifdef GL_ES
			precision lowp float;
		    #endif
			varying vec4 v_fragmentColor;
	 		varying vec2 v_texCoord;
		 	void main()
			 {
		 		vec4 c = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);
		 		gl_FragColor.xyz = vec3(0.2126*c.r + 0.7152*c.g + 0.0722*c.b);
		 		gl_FragColor.w = c.w;
	 		}
		`
	}
}
module.exports = ShaderUtils;