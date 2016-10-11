import THREE from 'three';

const glslify = require( 'glslify' );

export default class Plane extends THREE.Object3D {
  constructor() {
    super();

    this.geometry = new THREE.PlaneGeometry( 100, 100, 10, 10 );

    this.uniforms = {};

    this.material = new THREE.ShaderMaterial({
      color: 0x70b5e9,
      wireframe: false,
      uniforms: this.uniforms,
      vertexShader: glslify( '../../shaders/planeVertex.glsl' ),
      fragmentShader: glslify( '../../shaders/planeFragment.glsl' ),
    });

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.add( this.mesh );
  }

  update() {
    this.rotation.x += 0.3;
  }
}
