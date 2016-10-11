import THREE from 'three';
const glslify = require( 'glslify' );

export default class OcclusionLight extends THREE.Object3D {
  constructor() {
    super();

    this.geometry = new THREE.SphereGeometry( 9, 10, 10 );

    this.uniforms = {
      alpha: { type: 'f', value: 0 },
      color: { type: 'v3', value: new THREE.Color( 0x70b5e9 ) },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: glslify( '../../shaders/occlusionLightVertex.glsl' ),
      fragmentShader: glslify( '../../shaders/occlusionLightFragment.glsl' ),
      wireframe: false,
    });

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.add( this.mesh );
  }

  update() {
    this.rotation.x += 0.3;
  }
}
