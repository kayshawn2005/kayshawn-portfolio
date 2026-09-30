/**
 * The story's stage: one full-screen WebGL2 canvas that shows a scene "plate" (a realistic still plus its depth map)
 * as a 2.5D set the camera can move through.
 *
 *  - Parallax: every pixel is inverse-warped by its depth, so near things slide and grow more than far things when
 *    the camera trucks or pushes in. A few fixed-point steps solve the warp; small moves keep it clean.
 *  - Weather and light are drawn per plate in the same pass: rain in the air and on the lens, dust in the light,
 *    moving water, underwater caustics and bubbles, glints on the sea, a flickering tube light.
 *  - Two plates can be on stage at once while one dissolves into the next.
 * Nothing here follows the pointer as a light source; the pointer only nudges the camera a few pixels.
 */
import { clamp01, lerp } from '../lib/motion'

export interface PlateLook {
  /** Base name of the files in /plates: <file>.webp, <file>-sm.webp, <file>-depth.webp. */
  file: string
  /** Camera at the start and end of the scene: truck x, truck y (plate widths), push-in (0 = none). */
  cam: [from: [number, number, number], to: [number, number, number]]
  /** Depth that holds still while the camera moves (0 far, 1 near). */
  focus: number
  /** Plate point kept centred when the screen is narrower than the plate, at the start and end. */
  frame: [from: [number, number], to: [number, number]]
  /** Extra zoom on top of "cover" (1 = none), at the start and end. */
  zoom: [number, number]
  fx?: Partial<{
    rain: number
    drops: number
    dust: number
    water: number
    underwater: number
    flicker: number
    sparkle: number
    /** Plate height (0 bottom, 1 top) of the horizon, for glints on the sea below it. */
    horizon: number
  }>
  /** exposure, warmth (-1..1), saturation, vignette, at the start and end. */
  grade: [from: [number, number, number, number], to: [number, number, number, number]]
}

export interface StageFrame {
  a: PlateLook
  /** 0..1 progress through plate a (drives its camera and grade). */
  pa: number
  b: PlateLook | null
  pb: number
  /** 0 = only a, 1 = only b. */
  mix: number
  /** White-out for the phone pick-up, 0..1. */
  flash: number
  /** Fade to black, 0..1. */
  fade: number
}

export interface Stage {
  resize(): void
  /** Starts loading a plate's textures; resolves when it can be drawn. */
  load(look: PlateLook): Promise<void>
  ready(look: PlateLook): boolean
  render(frame: StageFrame, time: number): void
  /** Pointer in -1..1 on both axes; eased inside, and only moves the camera slightly. */
  point(x: number, y: number): void
  destroy(): void
}

const VERT = `#version 300 es
void main() { vec2 p = vec2(gl_VertexID == 1 ? 3. : -1., gl_VertexID == 2 ? 3. : -1.); gl_Position = vec4(p, 0., 1.); }`

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime, uMix, uFlash, uFade;
uniform sampler2D uColA, uDepA, uColB, uDepB;
uniform vec4 uCamA, uViewA, uFxA, uFx2A, uGradeA;
uniform vec4 uCamB, uViewB, uFxB, uFx2B, uGradeB;
out vec4 o;

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
float luma(vec3 c) { return dot(c, vec3(.2126, .7152, .0722)); }

// Beads of water that swell and dry on the lens. Returns refraction normal (xy) and coverage (z).
vec3 beads(vec2 s, float t, float scale) {
  vec2 g = s * scale, id = floor(g), f = fract(g) - .5, h = hash22(id);
  float life = fract(t * (.03 + .05 * h.y) + h.x);
  float r = mix(.1, .3, hash12(id + 7.1)) * smoothstep(0., .08, life) * smoothstep(1., .75, life) * step(.35, hash12(id + 2.9));
  vec2 d = f - (h - .5) * .5;
  float m = smoothstep(r, r * .65, length(d));
  return vec3(d / max(r, 1e-3) * m, m);
}
// Drops running down the lens, each dragging a thin wet trail of tiny beads.
vec3 runners(vec2 s, float t) {
  const float COLS = 9.;
  float col = floor(s.x * COLS), h = hash12(vec2(col, 3.7));
  if (h < .45) return vec3(0.);
  float y = 1.25 - fract(t * (.05 + .1 * h) + h * 7.) * 1.7;
  float x = (fract(s.x * COLS) - .5 + sin(s.y * 11. + h * 6.) * .05) / COLS;
  vec2 d = vec2(x, (s.y - y) * .85);
  float r = .011 + .006 * h;
  float drop = smoothstep(r, r * .6, length(d));
  float trail = smoothstep(.004, .0, abs(x)) * step(y, s.y) * smoothstep(y + .22, y, s.y);
  vec3 tb = beads(s, t * .2, 90.) * trail;
  return vec3(d / r * drop, drop) + vec3(tb.xy * .6, tb.z * .7);
}
// One layer of rain falling through the air: thin slanted streaks in tall cells.
float rainLayer(vec2 s, float t, float scale, float speed, float seed) {
  vec2 q = vec2(s.x * scale, s.y * scale * .09 + t * speed);
  q.x += q.y * .06;
  vec2 id = floor(q), f = fract(q);
  float h = hash12(id + seed), h2 = hash12(id + seed + 5.3);
  float x = fract(h * 13.71);
  float len = .25 + .5 * h2, y0 = fract(h2 * 7.1) * (1. - len);   // streaks of different lengths, not a curtain
  float line = smoothstep(.07, 0., abs(f.x - x)) * smoothstep(y0, y0 + len * .3, f.y) * smoothstep(y0 + len, y0 + len * .6, f.y);
  return step(.8, h) * line;
}
// Motes of dust drifting in the light.
float motes(vec2 s, float t, float scale) {
  vec2 q = s * scale + vec2(t * .07, t * .03), id = floor(q), f = fract(q), h = hash22(id);
  vec2 c = .5 + .32 * vec2(sin(t * (.2 + h.x * .3) + h.y * 6.28), cos(t * (.17 + h.y * .25) + h.x * 6.28));
  float tw = .55 + .45 * sin(t * (.8 + h.x * 1.6) + h.y * 6.28);
  return smoothstep(.07, 0., length(f - c)) * tw * step(.55, hash12(id + 1.3));
}
// Bubbles rising, drawn as soft rings.
float bubbles(vec2 s, float t, float scale) {
  vec2 q = s * scale; q.y -= t * (.35 * scale * .12);
  vec2 id = floor(q), f = fract(q), h = hash22(id);
  vec2 c = vec2(.5 + .3 * sin(t * 1.3 + h.x * 6.28 + q.y * .5), .5);
  float r = .08 + .1 * h.y;
  float d = length(f - c);
  return step(.62, h.x) * (smoothstep(r, r * .7, d) - smoothstep(r * .7, r * .35, d) * .75);
}
// Thin bright filaments of light on water and pool tiles.
float caustics(vec2 p, float t) {
  vec2 n = floor(p), f = fract(p);
  float d1 = 8., d2 = 8.;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j));
    vec2 q = .5 + .42 * sin(t + 6.2831 * hash22(n + g));
    float d = length(g + q - f);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
  }
  float e = 1. - smoothstep(0., .12, d2 - d1);
  return e * e * e;
}

// Screen point p (0..1, y up) to plate uv for a plate, with the camera applied.
vec2 toPlate(vec2 p, vec4 cam, vec4 view, sampler2D D, out float depth) {
  float va = uRes.x / uRes.y;
  vec2 win = vec2(min(1., va / view.w), min(1., view.w / va)) / view.z;
  vec2 c = clamp(view.xy, win * .5, 1. - win * .5);
  vec2 q = c + (p - .5) * win;
  vec2 uv = q;
  float d = 0.;
  for (int i = 0; i < 5; i++) {
    d = texture(D, uv).r;
    uv = c + (q - c - cam.xy * (d - cam.w)) / (1. + cam.z * (d - cam.w));
  }
  depth = d;
  return uv;
}

vec3 shade(sampler2D C, sampler2D D, vec4 cam, vec4 view, vec4 fx, vec4 fx2, vec4 gr, vec2 p, out float depth) {
  float t = uTime, va = uRes.x / uRes.y;
  vec2 s = vec2(p.x * va, p.y);
  vec2 sp = p;
  // underwater: the whole view wavers
  sp += fx.w * vec2(sin(p.y * 23. + t * 1.3), cos(p.x * 19. + t * 1.1)) * .0035;
  vec2 uv = toPlate(sp, cam, view, D, depth);

  vec3 base = texture(C, uv).rgb;
  // water surfaces (turquoise pixels, or the sea below the horizon) move
  float wet = fx.z * smoothstep(.04, .2, (base.g + base.b) * .5 - base.r) * smoothstep(.12, .35, base.b);
  if (fx2.z > 0.) wet = max(wet, fx.z * step(uv.y, fx2.z) * (1. - smoothstep(.45, .8, depth)));
  if (wet > 0.) {
    vec2 w = vec2(fbm(uv * vec2(30., 60.) + t * .35), fbm(uv * vec2(30., 60.) - t * .3 + 5.)) - .5;
    uv += w * .006 * wet;
  }
  // rain on the lens refracts and softens what is behind it
  vec3 lens = vec3(0.);
  if (fx2.w > 0.) {
    lens = beads(s, t, 16.) + beads(s + 3.7, t * .8, 28.) * .7 + runners(s, t);
    lens *= fx2.w;
  }
  vec2 ruv = uv + lens.xy * .018;
  vec3 col = texture(C, ruv).rgb;
  if (fx2.w > 0.) col = mix(textureLod(C, ruv, 2.2).rgb, col, .55 + .45 * clamp(lens.z, 0., 1.)) * (1. + lens.z * .12);

  // soft glow around the bright parts (lamps, the sun, the pool lights)
  vec3 glow = max(textureLod(C, uv, 5.).rgb - .45, 0.);
  col += glow * .55;

  float l = luma(col);
  // a fluorescent tube that is on its way out
  if (fx2.x > 0.) {
    float off = step(.86, hash12(vec2(floor(t * 13.), 1.))) * step(.62, fract(t * .23 + .1));
    col -= col * smoothstep(.45, .85, l) * off * .45 * fx2.x;
  }
  // rain in the air, in three depths that move with the camera
  if (fx.x > 0.) {
    float r = rainLayer(s + cam.xy * 2., t, 70., 11., 1.) * .5
            + rainLayer(s + cam.xy * 5., t, 42., 8., 2.) * .35
            + rainLayer(s + cam.xy * 9., t, 24., 5.5, 3.) * .25;
    col += vec3(.75, .82, .9) * r * fx.x * (.16 + .55 * l);
  }
  // dust in the light
  if (fx.y > 0.) {
    float m = motes(s + cam.xy * 4., t, 22.) + motes(s + cam.xy * 8. + 9., t * .8, 12.) * .7;
    col += vec3(.9, .95, 1.) * m * fx.y * smoothstep(.12, .5, l) * .5;
  }
  // glints on the sea
  if (fx2.y > 0. && wet > 0.) {
    vec2 g = uv * vec2(260., 900.);
    float glint = step(.994, hash12(floor(g) + floor(t * 5.))) * smoothstep(.45, .85, l);
    col += glint * fx2.y * vec3(1., .9, .75) * 1.6;
  }
  // underwater: caustics, shafts of light from above, bubbles, and the water's colour
  if (fx.w > 0.) {
    float c = caustics(s * 4. + vec2(t * .05, 0.), t * .8) * .6 + caustics(s * 7.3 + 2.1, t * 1.1) * .4;
    float shafts = fbm(vec2(s.x * 6. + s.y * 1.5, t * .15)) * smoothstep(0., 1., p.y);
    float b = bubbles(s + cam.xy * 6., t, 18.) + bubbles(s * 1.7 + cam.xy * 10. + 4., t * 1.2, 26.) * .6;
    col = mix(col, col * vec3(.72, 1., 1.06), .35 * fx.w);
    col += vec3(.45, .85, .95) * (c * .06 + shafts * .1 + b * .22) * fx.w;
  }

  // grade: exposure, warmth, saturation, vignette
  col *= gr.x;
  col *= vec3(1. + gr.y * .1, 1. + gr.y * .015, 1. - gr.y * .12);
  col = mix(vec3(luma(col)), col, gr.z);
  vec2 v = p - .5;
  col *= 1. - dot(v, v) * gr.w;
  return col;
}

void main() {
  vec2 p = gl_FragCoord.xy / uRes;
  float dA, dB;
  vec3 col = shade(uColA, uDepA, uCamA, uViewA, uFxA, uFx2A, uGradeA, p, dA);
  if (uMix > 0.) {
    vec3 colB = shade(uColB, uDepB, uCamB, uViewB, uFxB, uFx2B, uGradeB, p, dB);
    // the next scene arrives in soft patches, its far parts first
    float n = fbm(p * vec2(uRes.x / uRes.y, 1.) * 2.4 + 3.7) * .75 + (1. - dB) * .25;
    float w = .14;
    col = mix(col, colB, smoothstep(n - w, n + w, uMix * (1. + 2. * w) - w));
  }
  col = mix(col, vec3(1., .98, .94), uFlash);
  col *= 1. - uFade;
  col += (hash12(gl_FragCoord.xy + fract(uTime * 37.) * 311.) - .5) * .035;
  o = vec4(col, 1.);
}`

interface PlateTex {
  col: WebGLTexture
  dep: WebGLTexture
  aspect: number
}

function loadImage(url: string) {
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  return img.decode().then(() => img)
}

export function createStage(canvas: HTMLCanvasElement): Stage | null {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' })
  if (!gl) return null

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
    return s
  }
  const prog = gl.createProgram()!
  try {
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link')
  } catch (e) {
    console.warn('[stage] WebGL program failed, falling back to still images', e)
    return null
  }
  gl.useProgram(prog)
  const U = (n: string) => gl.getUniformLocation(prog, n)
  const u = {
    res: U('uRes'), time: U('uTime'), mix: U('uMix'), flash: U('uFlash'), fade: U('uFade'),
    A: { col: U('uColA'), dep: U('uDepA'), cam: U('uCamA'), view: U('uViewA'), fx: U('uFxA'), fx2: U('uFx2A'), grade: U('uGradeA') },
    B: { col: U('uColB'), dep: U('uDepB'), cam: U('uCamB'), view: U('uViewB'), fx: U('uFxB'), fx2: U('uFx2B'), grade: U('uGradeB') },
  }
  gl.uniform1i(u.A.col, 0)
  gl.uniform1i(u.A.dep, 1)
  gl.uniform1i(u.B.col, 2)
  gl.uniform1i(u.B.dep, 3)

  const makeTex = (img: HTMLImageElement, mips: boolean) => {
    const t = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    if (mips) gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return t
  }

  const plates = new Map<string, PlateTex>()
  const pending = new Map<string, Promise<void>>()
  let small = false
  let dpr = 1
  const px = { x: 0, y: 0, tx: 0, ty: 0 }

  const resize = () => {
    dpr = Math.min(1.5, window.devicePixelRatio || 1)
    // keep the pixel count sane on very large screens
    const scale = Math.min(dpr, 2400 / Math.max(1, canvas.clientWidth))
    canvas.width = Math.max(2, Math.round(canvas.clientWidth * scale))
    canvas.height = Math.max(2, Math.round(canvas.clientHeight * scale))
    small = canvas.width < 1400
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  resize()

  const load = (look: PlateLook) => {
    const key = look.file
    const existing = pending.get(key)
    if (existing) return existing
    const job = Promise.all([loadImage(`/plates/${key}${small ? '-sm' : ''}.webp`), loadImage(`/plates/${key}-depth.webp`)]).then(([c, d]) => {
      plates.set(key, { col: makeTex(c, true), dep: makeTex(d, false), aspect: c.naturalWidth / c.naturalHeight })
    })
    pending.set(key, job)
    job.catch(() => pending.delete(key))
    return job
  }

  const bind = (slot: typeof u.A, unit: number, look: PlateLook, p: number) => {
    const tex = plates.get(look.file)!
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, tex.col)
    gl.activeTexture(gl.TEXTURE0 + unit + 1)
    gl.bindTexture(gl.TEXTURE_2D, tex.dep)
    const [c0, c1] = look.cam
    const [f0, f1] = look.frame
    const [g0, g1] = look.grade
    const fx = look.fx ?? {}
    gl.uniform4f(slot.cam, lerp(c0[0], c1[0], p) + px.x * 0.006, lerp(c0[1], c1[1], p) + px.y * 0.004, lerp(c0[2], c1[2], p), look.focus)
    gl.uniform4f(slot.view, lerp(f0[0], f1[0], p), lerp(f0[1], f1[1], p), lerp(look.zoom[0], look.zoom[1], p), tex.aspect)
    gl.uniform4f(slot.fx, fx.rain ?? 0, fx.dust ?? 0, fx.water ?? 0, fx.underwater ?? 0)
    gl.uniform4f(slot.fx2, fx.flicker ?? 0, fx.sparkle ?? 0, fx.horizon ?? 0, fx.drops ?? 0)
    gl.uniform4f(slot.grade, lerp(g0[0], g1[0], p), lerp(g0[1], g1[1], p), lerp(g0[2], g1[2], p), lerp(g0[3], g1[3], p))
  }

  return {
    resize,
    load,
    ready: (look) => plates.has(look.file),
    point(x, y) {
      px.tx = x
      px.ty = y
    },
    render(f, time) {
      px.x += (px.tx - px.x) * 0.04
      px.y += (px.ty - px.y) * 0.04
      if (!plates.has(f.a.file)) return
      const withB = !!f.b && f.mix > 0.001 && plates.has(f.b.file)
      gl.uniform2f(u.res, canvas.width, canvas.height)
      gl.uniform1f(u.time, time)
      gl.uniform1f(u.mix, withB ? clamp01(f.mix) : 0)
      gl.uniform1f(u.flash, clamp01(f.flash))
      gl.uniform1f(u.fade, clamp01(f.fade))
      bind(u.A, 0, f.a, clamp01(f.pa))
      bind(u.B, 2, withB ? f.b! : f.a, clamp01(withB ? f.pb : f.pa))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    destroy() {
      plates.forEach((p) => {
        gl.deleteTexture(p.col)
        gl.deleteTexture(p.dep)
      })
      gl.deleteProgram(prog)
    },
  }
}
