/* eslint-disable */
import THREE from 'three';

class MeshLineGeometry extends THREE.BufferGeometry{

	constructor( g, widthCallback=null ) {

		super()

		this.positions = new Float32Array(g.length*2)
		let previous = []
		let next = []
		let side = []
		let width = []
		let indices_array = []
		let uvs = []

		// if( g instanceof THREE.Geometry ) {
		// 	for( let j = 0; j < g.vertices.length; j++ ) {
		// 		let v = g.vertices[ j ];
		// 		this.positions.push( v.x, v.y, v.z );
		// 		this.positions.push( v.x, v.y, v.z );
		// 	}
		// }

		if( g instanceof Float32Array || g instanceof Array ) {
			for( let j = 0; j < g.length; j += 3 ) {
				this.positions[j*2]=this.positions[j*2+3]=g[ j ]
				this.positions[j*2+1]=this.positions[j*2+4]=g[ j+1 ]
				this.positions[j*2+2]=this.positions[j*2+5]=g[ j+2 ]
			}
		}

		let l = this.positions.length / 6;
		for( let j = 0; j < l; j++ ) {
			side.push( 1 )
			side.push( -1 )
		}

		let w;
		for( let j = 0; j < l; j++ ) {
			w = widthCallback?widthCallback( j / ( l -1 ) ):1
			width.push( w, w )
		}

		for( let j = 0; j < l; j++ ) {
			uvs.push( j / ( l - 1 ), 0 )
			uvs.push( j / ( l - 1 ), 1 )
		}


		let v = this.compareV3( 0, l - 1 ) ? this.copyV3( l - 2 ) : this.copyV3( 0 )
		previous.push( v[ 0 ], v[ 1 ], v[ 2 ] )
		previous.push( v[ 0 ], v[ 1 ], v[ 2 ] )
		for( let j = 0; j < l - 1; j++ ) {
			v = this.copyV3( j )
			previous.push( v[ 0 ], v[ 1 ], v[ 2 ] )
			previous.push( v[ 0 ], v[ 1 ], v[ 2 ] )
		}

		for( let j = 1; j < l; j++ ) {
			v = this.copyV3( j )
			next.push( v[ 0 ], v[ 1 ], v[ 2 ] )
			next.push( v[ 0 ], v[ 1 ], v[ 2 ] )
		}

		v = this.copyV3( this.compareV3( l - 1, 0 )?1:( l - 1 ) )
		next.push( v[ 0 ], v[ 1 ], v[ 2 ] )
		next.push( v[ 0 ], v[ 1 ], v[ 2 ] )

		for( let j = 0; j < l - 1; j++ ) {
			let n = j * 2
			indices_array.push( n, n + 1, n + 2 )
			indices_array.push( n + 2, n + 1, n + 3 )
		}

		let attributes = {
			position: new THREE.BufferAttribute( this.positions, 3 ),
			previous: new THREE.BufferAttribute( new Float32Array( previous ), 3 ),
			next: new THREE.BufferAttribute( new Float32Array( next ), 3 ),
			side: new THREE.BufferAttribute( new Float32Array( side ), 1 ),
			width: new THREE.BufferAttribute( new Float32Array( width ), 1 ),
			uv: new THREE.BufferAttribute( new Float32Array( uvs ), 2 ),
			index: new THREE.BufferAttribute( new Uint16Array( indices_array ), 1 )
		}
		this.addAttribute( 'position', attributes.position )
		this.addAttribute( 'previous', attributes.previous )
		this.addAttribute( 'next', attributes.next )
		this.addAttribute( 'side', attributes.side )
		this.addAttribute( 'width', attributes.width )
		this.addAttribute( 'uv', attributes.uv )
		this.setIndex( attributes.index )

	}

	compareV3( a, b ) {
		let aa = a * 6
		let ab = b * 6
		return ( this.positions[ aa ] === this.positions[ ab ] ) && ( this.positions[ aa + 1 ] === this.positions[ ab + 1 ] ) && ( this.positions[ aa + 2 ] === this.positions[ ab + 2 ] )
	}

	copyV3( a ) {
		let aa = a * 6
		return [ this.positions[ aa ], this.positions[ aa + 1 ], this.positions[ aa + 2 ] ]
	}

}
module.exports = MeshLineGeometry
