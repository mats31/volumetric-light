import THREE from 'three';
import MeshLineGeometry from '../class/MeshLineGeometry';
import MeshLineMaterial from '../class/MeshLineMaterial';

export default class MeshLine extends THREE.Object3D {
  constructor( path, color, texture, alpha, lineWidth ) {
    super();

    this.time = 0;
    // this._clock = clock;
    // this._radius = Math.random() * 13 + 7;
    // this._phi = Math.PI * 0.35;
    // this._theta = Math.PI * 0.5;
    this.geometry = new MeshLineGeometry( path, ( t ) => { return Math.abs( Math.sin( t * 10 ) ) + 0.2; });
    this.material = new MeshLineMaterial(
      {
        alpha,
        color,
        lineWidth,
        map: texture,
        time: this.time,
      }
    );

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.add( this.mesh );
  }

  setGeometry() {

  }

  update() {
  }
}
