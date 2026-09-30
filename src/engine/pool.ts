/**
 * Night-swim pool renderer (WebGL2, no dependencies).
 *  - Ripples: a 2D wave equation on two ping-ponged half-float textures; the pointer drops pebbles into it.
 *  - Water: tiles, lane lines and animated Voronoi caustics, refracted by the ripple slope.
 *  - Floats: photographs printed with a white border, riding the swell, with a soft shadow on the water.
 * Every position is passed in CSS pixels; the shader works in device pixels with y pointing down.
 */
export interface Float {
  x: number
  y: number
  w: number
  rot: number
}

export interface Pool {
  resize(): void
  drop(x: number, y: number, strength: number, radius?: number): void
  render(t: number, floats: Float[]): void
  destroy(): void
}

const MAX_FLOATS = 5
const CELL_W = 480
const CELL_H = 600

const VERT = `#version 300 es
void main() { vec2 p = vec2(gl_VertexID == 1 ? 3. : -1., gl_VertexID == 2 ? 3. : -1.); gl_Position = vec4(p, 0., 1.); }`

const SIM = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform vec4 uDrop; // uv.xy, radius (in texture heights), strength
out vec4 o;
void main() {
  vec2 uv = gl_FragCoord.xy * uTexel;
  vec4 s = texture(uState, uv);
  float avg = (texture(uState, uv + vec2(uTexel.x, 0.)).r + texture(uState, uv - vec2(uTexel.x, 0.)).r
             + texture(uState, uv + vec2(0., uTexel.y)).r + texture(uState, uv - vec2(0., uTexel.y)).r) * .25;
  s.g += (avg - s.r) * 2.;
  s.g *= .986;
  s.r += s.g;
  s.r *= .998;
  if (uDrop.w != 0.) {
    float k = max(0., 1. - length((uv - uDrop.xy) * vec2(uTexel.y / uTexel.x, 1.)) / uDrop.z);
    s.r += (.5 - cos(k * 3.14159) * .5) * uDrop.w;
  }
  o = s;
}`

const RENDER = `#version 300 es
precision highp float;
uniform sampler2D uHeight;
uniform sampler2D uAtlas;
uniform vec2 uRes;
uniform float uTime, uDpr, uCount, uRipple;
uniform vec4 uFloat[${MAX_FLOATS}];
uniform float uRot[${MAX_FLOATS}];
out vec4 o;

vec2 hash2(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
float cells(vec2 p, float t) {
  vec2 n = floor(p), f = fract(p);
  float d1 = 8., d2 = 8.;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j));
    vec2 q = .5 + .42 * sin(t + 6.2831 * hash2(n + g));
    float d = length(g + q - f);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
  }
  float edge = 1. - smoothstep(0., .1, d2 - d1);
  return edge * edge * edge;   // thin, bright filaments rather than a uniform mesh
}
float sdBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }

vec3 water(vec2 p, float t) {
  vec2 u = p / uRes.y;
  vec3 col = mix(vec3(.05, .22, .42), vec3(.01, .05, .15), smoothstep(-.1, 1.1, u.y));   // deep blue night water
  float tile = 48. * uDpr;
  vec2 g = abs(fract(p / tile) - .5) * tile;
  col *= 1. - (1. - smoothstep(0., 1.4 * uDpr, min(g.x, g.y))) * .12;
  float laneW = uRes.y * .26;
  float ly = abs(fract(p.y / laneW - .5) - .5) * laneW;
  col = mix(col, vec3(.01, .04, .14), (1. - smoothstep(4. * uDpr, 6. * uDpr, ly)) * .6);
  float c = cells(u * 5.5 + vec2(t * .04, 0.), t * .7) * .55 + cells(u * 10.5 - vec2(0., t * .03) + 3.1, t * .9) * .45;
  float patchy = .45 + .55 * (.5 + .5 * sin(u.x * 3.1 + t * .3) * sin(u.y * 2.3 - t * .25)); // light pools unevenly
  col += vec3(.55, .8, 1.) * c * .14 * patchy;
  // light glittering on the surface, in drifting clusters
  vec2 gq = floor(p / (5. * uDpr));
  float cluster = smoothstep(.6, .8, sin(u.x * 4.1 + t * .2) * sin(u.y * 3.3 - t * .15) * .5 + .5);
  float glint = step(.992, fract(sin(dot(gq + floor(t * 4.), vec2(12.9898, 78.233))) * 43758.5453));
  return col + vec3(.9, .96, 1.) * glint * cluster * .9;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 e = 1. / vec2(textureSize(uHeight, 0));
  vec2 grad = uRipple * vec2(texture(uHeight, uv + vec2(e.x, 0.)).r - texture(uHeight, uv - vec2(e.x, 0.)).r,
                             texture(uHeight, uv + vec2(0., e.y)).r - texture(uHeight, uv - vec2(0., e.y)).r);
  vec2 off = vec2(grad.x, -grad.y);
  vec3 col = water(p + off * 130. * uDpr, uTime);

  float shade = 0.;
  vec4 top = vec4(0.);
  for (int k = 0; k < ${MAX_FLOATS}; k++) {
    if (float(k) >= uCount) break;
    vec4 F = uFloat[k];
    float c = cos(uRot[k]), s = sin(uRot[k]);
    mat2 inv = mat2(c, -s, s, c);
    vec2 q = p + off * 10. * uDpr;
    shade = max(shade, (1. - smoothstep(-6. * uDpr, 26. * uDpr, sdBox(inv * (q - F.xy - vec2(10., 18.) * uDpr), F.zw, 4. * uDpr))) * .5);
    vec2 lp = inv * (q - F.xy);
    float d = sdBox(lp, F.zw, 5. * uDpr);
    if (d < 1.5 * uDpr) {
      float b = F.z * .07;
      vec2 il = lp + vec2(0., b * .9);
      vec2 ib = F.zw - vec2(b, b * 1.9);
      vec3 fc = vec3(.95, .94, .91);
      if (abs(il.x) < ib.x && abs(il.y) < ib.y) {
        vec2 t = il / ib * .5 + .5;
        fc = texture(uAtlas, vec2((float(k) + t.x) / ${MAX_FLOATS}., t.y)).rgb;
      }
      float a = smoothstep(1.5 * uDpr, -1.5 * uDpr, d);
      top = vec4(mix(top.rgb, fc, a), max(top.a, a));
    }
  }
  col *= 1. - shade * (1. - top.a);
  col = mix(col, top.rgb, top.a);
  vec3 n = normalize(vec3(-off * 14., 1.));
  col += pow(max(dot(n, normalize(vec3(-.3, -.5, .8))), 0.), 60.) * .95 * uRipple * (1. - top.a * .6);
  vec2 vq = uv - .5;
  col *= 1. - dot(vq, vq) * .9;
  o = vec4(col, 1.);
}`

function buildAtlas(sources: string[]) {
  const c = document.createElement('canvas')
  c.width = CELL_W * MAX_FLOATS
  c.height = CELL_H
  const x = c.getContext('2d')!
  return Promise.all(
    sources.slice(0, MAX_FLOATS).map(
      (src, i) =>
        new Promise<void>((done) => {
          const img = new Image()
          img.onload = () => {
            const k = Math.max(CELL_W / img.width, CELL_H / img.height)
            x.save()
            x.beginPath()
            x.rect(i * CELL_W, 0, CELL_W, CELL_H)
            x.clip()
            x.drawImage(img, i * CELL_W + (CELL_W - img.width * k) / 2, (CELL_H - img.height * k) / 2, img.width * k, img.height * k)
            x.restore()
            done()
          }
          img.onerror = () => done()
          img.src = src
        }),
    ),
  ).then(() => c)
}

export async function createPool(canvas: HTMLCanvasElement, sources: string[]): Promise<Pool | null> {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false })
  if (!gl) return null
  const ripples = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'))

  const program = (fs: string) => {
    const p = gl.createProgram()!
    for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, fs]] as const) {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
      gl.attachShader(p, s)
    }
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link')
    return p
  }
  let sim: WebGLProgram | null
  let draw: WebGLProgram
  try {
    sim = ripples ? program(SIM) : null
    draw = program(RENDER)
  } catch {
    return null
  }
  const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n)
  const su = sim && { state: U(sim, 'uState'), texel: U(sim, 'uTexel'), drop: U(sim, 'uDrop') }
  const ru = {
    height: U(draw, 'uHeight'), atlas: U(draw, 'uAtlas'), res: U(draw, 'uRes'), time: U(draw, 'uTime'), dpr: U(draw, 'uDpr'),
    count: U(draw, 'uCount'), ripple: U(draw, 'uRipple'), float: U(draw, 'uFloat'), rot: U(draw, 'uRot'),
  }

  const atlasCanvas = await buildAtlas(sources)
  const atlas = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, atlas)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  // Height field: RGBA16F (r = height, g = velocity). A 1×1 zero texture stands in when ripples are unsupported.
  let simW = 1
  let simH = 1
  let tex: WebGLTexture[] = []
  let fbo: WebGLFramebuffer[] = []
  let cur = 0
  const makeSim = () => {
    tex.forEach((t) => gl.deleteTexture(t))
    fbo.forEach((f) => gl.deleteFramebuffer(f))
    simW = ripples ? 256 : 1
    simH = ripples ? Math.max(64, Math.round((256 * canvas.height) / Math.max(1, canvas.width))) : 1
    tex = [0, 1].map(() => {
      const t = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, simW, simH, 0, gl.RGBA, gl.HALF_FLOAT, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      return t
    })
    fbo = ripples
      ? tex.map((t) => {
          const f = gl.createFramebuffer()!
          gl.bindFramebuffer(gl.FRAMEBUFFER, f)
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0)
          gl.clearColor(0, 0, 0, 0)
          gl.clear(gl.COLOR_BUFFER_BIT)
          return f
        })
      : []
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  let dpr = 1
  const resize = () => {
    dpr = Math.min(1.5, window.devicePixelRatio || 1)
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr))
    const h = Math.max(2, Math.round(canvas.clientHeight * dpr))
    if (w === canvas.width && h === canvas.height && tex.length) return
    canvas.width = w
    canvas.height = h
    makeSim()
  }
  resize()

  const drops: number[][] = []
  const step = () => {
    if (!sim || !su) return
    gl.useProgram(sim)
    gl.viewport(0, 0, simW, simH)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, tex[cur])
    gl.uniform1i(su.state, 0)
    gl.uniform2f(su.texel, 1 / simW, 1 / simH)
    gl.uniform4fv(su.drop, drops.shift() ?? [0, 0, 0, 0])
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[1 - cur])
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    cur = 1 - cur
  }

  const floatData = new Float32Array(MAX_FLOATS * 4)
  const rotData = new Float32Array(MAX_FLOATS)

  return {
    resize,
    drop(x, y, strength, radius = 0.03) {
      if (!ripples) return
      drops.push([x / canvas.clientWidth, 1 - y / canvas.clientHeight, radius, strength])
      if (drops.length > 6) drops.shift()
    },
    render(t, floats) {
      const steps = Math.min(4, Math.max(2, drops.length))
      for (let i = 0; i < steps; i++) step()
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(draw)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, tex[cur])
      gl.uniform1i(ru.height, 0)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, atlas)
      gl.uniform1i(ru.atlas, 1)
      floats.slice(0, MAX_FLOATS).forEach((f, i) => {
        floatData.set([f.x * dpr, f.y * dpr, (f.w / 2) * dpr, f.w * 0.625 * dpr], i * 4)
        rotData[i] = f.rot
      })
      gl.uniform2f(ru.res, canvas.width, canvas.height)
      gl.uniform1f(ru.time, t)
      gl.uniform1f(ru.dpr, dpr)
      gl.uniform1f(ru.count, Math.min(MAX_FLOATS, floats.length))
      gl.uniform1f(ru.ripple, ripples ? 1 : 0)
      gl.uniform4fv(ru.float, floatData)
      gl.uniform1fv(ru.rot, rotData)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    destroy() {
      tex.forEach((tx) => gl.deleteTexture(tx))
      fbo.forEach((f) => gl.deleteFramebuffer(f))
      gl.deleteTexture(atlas)
      if (sim) gl.deleteProgram(sim)
      gl.deleteProgram(draw)
    },
  }
}
