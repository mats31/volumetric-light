import THREE from 'three';

export default class Sphere extends THREE.Object3D {
  constructor() {
    super();

    this.geometry = new THREE.SphereGeometry( 20, 20, 20 );
    this.material = new THREE.MeshBasicMaterial({
      color: 0x70b5e9,
      wireframe: true,
    });

    window.gui.addColor( this.material, 'color' );

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.add( this.mesh );
  }

  update() {
    this.rotation.x += 0.3;
  }
}
