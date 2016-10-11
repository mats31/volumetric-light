varying vec3 pos;

void main() {

	float dist = distance( pos, vec3( 0. )  ) / 100.;
	vec3 color = vec3( dist );

	 gl_FragColor = vec4( vec3( color ), 1.0 );
}
