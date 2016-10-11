import THREE from 'three';

export default class OcclusionSphere extends THREE.Object3D {
  constructor() {
    super();

    this.geometry = new THREE.IcosahedronGeometry( 10, 2 );
    this.material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframeLinewidth: 5,
      wireframe: true,
    });

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.add( this.mesh );
  }

  update() {
    this.rotation.x += 0.03;
    this.rotation.y += 0.03;
    this.rotation.z += 0.03;
  }
}
