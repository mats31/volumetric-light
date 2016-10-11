#extension GL_OES_standard_derivatives : enable

precision mediump float;

uniform float alpha;
uniform float alphaLimit;
uniform float offset;
uniform float time;
uniform sampler2D map;
uniform vec3 color;
// uniform sampler2D map;
// uniform float useMap;
//
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

varying vec2 vUv;
// varying vec4 vColor;
// varying vec3 vPosition;

void main() {
	vec2 uv = vUv;
  // uv.x += sin( time * 0.1);
  uv.x += ( time * ( 0.05 * offset ) ) + rand( uv ) * .000000001;
  uv.y += ( time * ( 0.05 * offset ) ) + rand( uv ) * .000000001;
	// uv.y +=
	// uv.x = smoothstep( uv.x * 2., uv.y * 2. + 2., -time * 2000. );

	vec4 texture = texture2D( map, uv );
  float _alpha = alpha * min( 1., alphaLimit - 0.2 ) * abs( sin( time * 0.1 + offset ) );
	gl_FragColor = vec4( color, 1. * _alpha ) * texture;
	// gl_FragColor = vec4( vec3( mod( time / 10., 1. ), 0., 1. ), 1. );
}
