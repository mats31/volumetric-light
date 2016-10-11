import THREE from 'three';
window.THREE = THREE;
const OrbitControls = require( 'three-orbit-controls' )( THREE );
const glslify = require( 'glslify' );

import MeshLine from './objects/MeshLine';
import OcclusionLight from './objects/OcclusionScene/OcclusionLight.js';
import OcclusionSphere from './objects/OcclusionScene/OcclusionSphere.js';
import Plane from './objects/NormalScene/Plane.js';
import Sphere from './objects/NormalScene/Sphere.js';

import WAGNER from '@superguigui/wagner';
import BlendPass from '@superguigui/wagner/src/passes/blend/BlendPass';
import BoxBlurPass from '@superguigui/wagner/src/passes/box-blur/BoxBlurPass';
import GodrayPass from '@superguigui/wagner/src/passes/godray/godraypass';
import MultiPassBloomPass from '@superguigui/wagner/src/passes/bloom/MultiPassBloomPass';

export default class Webgl {
  constructor( width, height ) {
    this.params = {};

    this.camera = new THREE.PerspectiveCamera( 50, width / height, 1, 1000 );
    this.camera.position.z = 100;

    this.easing = 0.1;
    this.lightLimit = 0;
    this.meshLineNumbers = 1000;
    this.meshLineObject = new THREE.Object3D;
    this.meshLineObject.scale.set( this.lightLimit, this.lightLimit, this.lightLimit );
    this.occlusionMeshLineObject = new THREE.Object3D;
    this.occlusionMeshLineObject.scale.set( this.lightLimit, this.lightLimit, this.lightLimit );
    this.occlusionMeshLines = [];
    this.normalMeshLines = [];
    this.lastUpdate = Date.now();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( width, height );
    this.renderer.setClearColor( 0x000000 );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.minDistance = 100;
    this.controls.maxDistance = 150;

    this.startRender = false;

    new THREE.TextureLoader().load(
      'texture/texture.png',
      ( texture ) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        this.createMeshLines( texture );
        this.setOcclusionScene( width, height );
        this.setScene( width, height );
        this.initPostprocessing( width, height );
      }
    );
  }

  createMeshLines( texture ) {
    texture.minFilter = THREE.LinearFilter;

    for ( let i = 0; i < this.meshLineNumbers; i++ ) {

      const steps = 128;
      const path = [];

      let lineWidth = 0.3;
      let alpha = Math.random() * ( 1 - 0.8 ) + 0.8;
      let z = 0;
      let x = 0;
      let y = 0;
      let phi = Math.PI * 2 * Math.random();
      let theta = Math.PI * 2 * Math.random();

      if ( i < this.meshLineNumbers * 0.8 ) {
        const radius = Math.random() > 0.5 ? Math.random() * ( 30 - 13 ) + 13 : ( Math.random() * ( 30 - 13 ) + 13 ) * -1;
        const epsilonPhi = 0.160;
        const epsilonTheta = 0.140;

        for ( let j = 0; j < steps; j++ ) {
          x = radius * Math.sin( phi ) * Math.cos( theta );
          y = radius * Math.cos( phi );
          z = radius * Math.sin( phi ) * Math.sin( theta );
          phi += epsilonPhi;
          theta += epsilonTheta;

          path.push( x, y, z );
        }
      } else {
        const radius = Math.random() > 0.5 ? Math.random() * ( 60 - 40 ) + 40 : ( Math.random() * ( 60 - 40 ) + 40 ) * -1;
        // const epsilonPhi = 0.005;
        // const epsilonTheta = 0.009;
        const epsilonPhi = Math.random() * ( 0.025 - 0.005 ) + 0.005;
        const epsilonTheta = Math.random() * ( 0.025 - 0.009 ) + 0.009;

        for ( let j = 0; j < steps; j++ ) {
          x = radius * Math.sin( phi ) * Math.cos( theta );
          y = radius * Math.cos( phi );
          z = radius * Math.sin( phi ) * Math.sin( theta );
          phi += epsilonPhi;
          theta += epsilonTheta;

          path.push( x, y, z );
        }

        alpha = Math.random() * 0.7;
        lineWidth = Math.random() * 0.6;
      }

      const occlusionMeshLine = new MeshLine( path, new THREE.Color( 0x000000 ), texture, alpha, lineWidth );
      occlusionMeshLine.position.set( 0, 0, 0 );
      this.occlusionMeshLines.push( occlusionMeshLine );

      const normalMeshLine = new MeshLine( path, new THREE.Color( 0x70b5e9 ), texture, alpha, lineWidth );
      normalMeshLine.position.set( 0, 0, 0 );
      this.normalMeshLines.push( normalMeshLine );
    }
  }

  initPostprocessing( width, height ) {
    this.composer = new WAGNER.Composer( this.renderer );
    this.composer.setSize( width, height );

    this.godrayPass = new GodrayPass();
    // window.gui.add( this.godrayPass.params, 'fX', 0, 1 );
    // window.gui.add( this.godrayPass.params, 'fY', 0, 1 );
    // window.gui.add( this.godrayPass.params, 'fExposure', 0, 1 );
    // window.gui.add( this.godrayPass.params, 'fDecay', 0, 1 );
    // window.gui.add( this.godrayPass.params, 'fDensity', 0, 1 );
    // window.gui.add( this.godrayPass.params, 'fWeight', 0, 1 );
    // window.gui.add( this.godrayPass.params, 'fClamp', 0, 1 );

    // this.bloomPass = new MultiPassBloomPass(
    //   {
    //     blendMode: 11,
    //     blurAmount: 0.1,
    //     height: window.innerHeight,
    //     width: window.innerWidth,
    //   }
    // );
    // window.gui.add( this.bloomPass.params, 'blendMode' );
    // window.gui.add( this.bloomPass.params, 'blurAmount', 0, 50 );
    // window.gui.add( this.bloomPass.params, 'zoomBlurStrength', 0, 50 );

    this.blendPass = new BlendPass();
    this.blendPass.params.mode = WAGNER.BlendMode.LinearDodge; // Lighten, LinearDodge, ColorDodge,
    this.blendPass.params.resolution2.x = width;
    this.blendPass.params.resolution2.y = height;
    this.blendPass.params.aspectRatio = width / height;
    this.blendPass.params.aspectRatio2 = width / height;
    this.blendPass.params.tInput2 = this.occlusionRenderer;

    this.startRender = true;
  }

  resize( width, height ) {
    if ( this.composer ) {
      this.composer.setSize( width, height );
    }

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.blendPass.params.resolution2.x = this.width;
    this.blendPass.params.resolution2.y = this.height;
    this.blendPass.params.aspectRatio = this.width / this.height;
    this.blendPass.params.aspectRatio2 = this.width / this.height;

    this.renderer.setSize( width, height );
  }

  render() {

    if ( this.startRender ) {
      const now = Date.now();
      const dt = now - this.lastUpdate;
      this.lastUpdate = now;
      this.lightLimit = this.lightLimit >= 1 ? this.lightLimit : this.lightLimit + 0.05;

      for ( let i = 0; i < this.normalMeshLines.length; i++ ) {
        // Divide by 16 because 16 * 60 = 1000 (60 fps)
        this.normalMeshLines[i].time += dt / 16 * 0.1;
        this.normalMeshLines[i].material.uniforms.time.value = this.normalMeshLines[i].time;
        this.normalMeshLines[i].material.uniforms.alphaLimit.value += ( this.lightLimit - this.normalMeshLines[i].material.uniforms.alphaLimit.value ) * this.easing;
        this.occlusionMeshLines[i].material.uniforms.alphaLimit.value += ( this.lightLimit - this.occlusionMeshLines[i].material.uniforms.alphaLimit.value ) * this.easing;
      }

      this.meshLineObject.scale.set(
        this.meshLineObject.scale.x + ( ( this.lightLimit - this.meshLineObject.scale.x ) * this.easing ),
        this.meshLineObject.scale.y + ( ( this.lightLimit - this.meshLineObject.scale.y ) * this.easing ),
        this.meshLineObject.scale.z + ( ( this.lightLimit - this.meshLineObject.scale.z ) * this.easing )
      );

      this.occlusionMeshLineObject.scale.set(
        this.occlusionMeshLineObject.scale.x + ( ( this.lightLimit - this.occlusionMeshLineObject.scale.x ) * this.easing ),
        this.occlusionMeshLineObject.scale.y + ( ( this.lightLimit - this.occlusionMeshLineObject.scale.y ) * this.easing ),
        this.occlusionMeshLineObject.scale.z + ( ( this.lightLimit - this.occlusionMeshLineObject.scale.z ) * this.easing )
      );

      this.occlusionLight.scale.set(
        this.occlusionLight.scale.x + ( ( this.lightLimit - this.occlusionLight.scale.x ) * this.easing ),
        this.occlusionLight.scale.y + ( ( this.lightLimit - this.occlusionLight.scale.y ) * this.easing ),
        this.occlusionLight.scale.z + ( ( this.lightLimit - this.occlusionLight.scale.z ) * this.easing )
      );

      this.composer.reset();
      this.composer.renderer.clear();
      this.composer.render( this.occlusionScene, this.camera );
      this.composer.pass( this.godrayPass );
      this.composer.toTexture( this.occlusionRenderer );
      this.composer.render( this.scene, this.camera );
      this.composer.pass( this.blendPass );
      // this.composer.pass( this.bloomPass );
      this.composer.toScreen();
    }
  }

  setOcclusionScene( width, height ) {
    this.occlusionScene = new THREE.Scene();

    this.occlusionRenderer = new THREE.WebGLRenderTarget( width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });

    this.occlusionLight = new OcclusionLight();
    this.occlusionLight.position.set( 0, 0, 0 );
    this.occlusionLight.scale.set( this.lightLimit, this.lightLimit, this.lightLimit );
    this.occlusionScene.add( this.occlusionLight );

    for ( let i = 0; i < this.occlusionMeshLines.length; i++ ) {
      this.occlusionMeshLineObject.add( this.occlusionMeshLines[i]);
    }
    this.occlusionScene.add( this.occlusionMeshLineObject );
  }

  setScene() {
    this.scene = new THREE.Scene();

    for ( let i = 0; i < this.normalMeshLines.length; i++ ) {
      this.meshLineObject.add( this.normalMeshLines[i]);
    }
    this.scene.add( this.meshLineObject );
  }
}
