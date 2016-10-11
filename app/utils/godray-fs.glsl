const int NUM_SAMPLES = 16;

uniform float exposure;
uniform float decay;
uniform float density;
uniform float weight;
uniform vec2 lightPositionOnScreen;
uniform sampler2D occlusionTexture;

varying vec2 vUv;

void main()
{
	// gl_FragColor = vec4(1.);
	vec2 uv = vUv;
	// gl_FragColor = vec4(uv.x,uv.y,0.,1.);
	gl_FragColor = vec4(texture2D(occlusionTexture, uv).rgb,1.);
	vec2 deltaTextCoord = vec2( uv - lightPositionOnScreen.xy );
	deltaTextCoord *= 1.0 / float(NUM_SAMPLES) * density;
	float illuminationDecay = 1.0;

	for( int i=0; i < NUM_SAMPLES; i++)
	{
		uv -= deltaTextCoord;
		vec4 sample = texture2D(occlusionTexture, uv );

		sample *= illuminationDecay * weight;

		gl_FragColor += sample;

		illuminationDecay *= decay;
	}

	 gl_FragColor *= exposure;
}
