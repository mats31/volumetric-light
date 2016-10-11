uniform float alpha;
uniform vec3 color;

void main() {

	 gl_FragColor = vec4( color, alpha );
}
