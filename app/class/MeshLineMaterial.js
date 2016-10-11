/* eslint-disable */
import THREE from 'three';

const glslify = require( 'glslify' );

const vs = glslify('../shaders/meshLineVertex.glsl');
const fs = glslify('../shaders/meshLineFragment.glsl');

class MeshLineMaterial extends THREE.RawShaderMaterial{

	constructor( {alpha = 1.0, color = new THREE.Color( 0xffffff ), time, lineWidth = 15, vertexShader=vs, fragmentShader=fs, resolution = new THREE.Vector2(1,1), map = new THREE.Vector2( 0, 0 )} = {} ){
		super( {
			uniforms:{
				alpha: { type: 'f', value: alpha },
				alphaLimit: { type: 'f', value: 0.05 },
				color: { type: 'v3', value: color },
				time: { type: 'f', value: time },
				lineWidth: { type: 'f', value: lineWidth },
				map: { type:'t', value: map },
				resolution: { type: 'v2', value: resolution },
				offset: { type: 'f', value: Math.random() * 10 },
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			transparent: true
		})

		this.type = 'MeshLineMaterial'
	}
}

module.exports = MeshLineMaterial
