/**
 * Animated WebGL shader background — JiliAce neon aurora (site-wide).
 */
(function () {
    'use strict';

    var VERT = [
        'attribute vec2 a_position;',
        'void main(){',
        '  gl_Position = vec4(a_position, 0.0, 1.0);',
        '}',
    ].join('\n');

    var FRAG = [
        'precision highp float;',
        'uniform vec2 u_resolution;',
        'uniform float u_time;',
        'uniform vec2 u_mouse;',
        '',
        'float hash(vec2 p){',
        '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);',
        '}',
        '',
        'float noise(vec2 p){',
        '  vec2 i = floor(p);',
        '  vec2 f = fract(p);',
        '  vec2 u = f * f * (3.0 - 2.0 * f);',
        '  return mix(',
        '    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),',
        '    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),',
        '    u.y',
        '  );',
        '}',
        '',
        'float fbm(vec2 p){',
        '  float v = 0.0;',
        '  float a = 0.5;',
        '  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);',
        '  for(int i = 0; i < 5; i++){',
        '    v += a * noise(p);',
        '    p = m * p;',
        '    a *= 0.5;',
        '  }',
        '  return v;',
        '}',
        '',
        'void main(){',
        '  vec2 uv = gl_FragCoord.xy / u_resolution.xy;',
        '  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);',
        '  vec2 mp = (u_mouse * 2.0 - 1.0) * 0.18;',
        '  p += mp;',
        '',
        '  float t = u_time * 0.14;',
        '  vec2 q = vec2(fbm(p * 0.9 + vec2(0.0, t)), fbm(p * 0.9 + vec2(5.2, -t * 0.85)));',
        '  vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.35), fbm(p + 4.0 * q + vec2(8.3, 2.8) - t * 0.28));',
        '  float f = fbm(p + 3.5 * r);',
        '',
        '  vec3 crimson = vec3(1.0, 0.12, 0.28);',
        '  vec3 cyan = vec3(0.13, 0.83, 0.93);',
        '  vec3 voidCol = vec3(0.012, 0.012, 0.028);',
        '',
        '  vec3 col = voidCol;',
        '  col = mix(col, crimson, clamp(f * f * 1.35, 0.0, 1.0) * 0.55);',
        '  col = mix(col, cyan, clamp(length(q + r) * 0.38, 0.0, 1.0) * 0.32);',
        '  col = mix(col, vec3(0.08, 0.02, 0.04), clamp(pow(f, 3.0) * 1.2, 0.0, 1.0) * 0.4);',
        '',
        '  float vign = smoothstep(1.35, 0.25, length(p * vec2(0.95, 1.05)));',
        '  col *= vign;',
        '',
        '  float scan = 0.96 + 0.04 * sin((uv.y + t * 0.5) * u_resolution.y * 0.65);',
        '  col *= scan;',
        '',
        '  float topGlow = smoothstep(0.85, 0.0, uv.y) * 0.12;',
        '  col += crimson * topGlow;',
        '',
        '  gl_FragColor = vec4(col, 1.0);',
        '}',
    ].join('\n');

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function createShader(gl, type, source) {
        var sh = gl.createShader(type);
        gl.shaderSource(sh, source);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            return null;
        }
        return sh;
    }

    function createProgram(gl, vsSource, fsSource) {
        var vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
        var fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        if (!vs || !fs) return null;
        var prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
        return prog;
    }

    function init() {
        if (document.querySelector('#shader-bg')) return;

        var canvas = document.createElement('canvas');
        canvas.id = 'shader-bg';
        canvas.className = 'shader-bg';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.prepend(canvas);

        var gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
        if (!gl) {
            canvas.remove();
            document.body.classList.add('has-shader-bg', 'has-shader-bg--static');
            return;
        }

        var program = createProgram(gl, VERT, FRAG);
        if (!program) {
            canvas.remove();
            document.body.classList.add('has-shader-bg', 'has-shader-bg--static');
            return;
        }

        document.body.classList.add('has-shader-bg');

        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

        var aPos = gl.getAttribLocation(program, 'a_position');
        var uRes = gl.getUniformLocation(program, 'u_resolution');
        var uTime = gl.getUniformLocation(program, 'u_time');
        var uMouse = gl.getUniformLocation(program, 'u_mouse');

        var mouse = { x: 0.5, y: 0.35 };
        var smoothMouse = { x: mouse.x, y: mouse.y };
        var start = performance.now();
        var paused = false;
        var rafId = 0;
        var reduced = prefersReducedMotion();

        function resize() {
            var dpr = Math.min(window.devicePixelRatio || 1, reduced ? 1 : 1.75);
            if (window.innerWidth < 768) dpr = Math.min(dpr, 1.15);
            var w = Math.floor(window.innerWidth * dpr);
            var h = Math.floor(window.innerHeight * dpr);
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                gl.viewport(0, 0, w, h);
            }
        }

        function onMove(e) {
            mouse.x = e.clientX / window.innerWidth;
            mouse.y = 1.0 - e.clientY / window.innerHeight;
        }

        function draw(now) {
            if (paused) return;
            if (!reduced) rafId = window.requestAnimationFrame(draw);

            smoothMouse.x += (mouse.x - smoothMouse.x) * 0.06;
            smoothMouse.y += (mouse.y - smoothMouse.y) * 0.06;

            var t = reduced ? 0.0 : (now - start) * 0.001;

            gl.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uTime, t);
            gl.uniform2f(uMouse, smoothMouse.x, smoothMouse.y);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        resize();
        window.addEventListener('resize', resize, { passive: true });
        if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            window.addEventListener('mousemove', onMove, { passive: true });
        }

        document.addEventListener('visibilitychange', function () {
            paused = document.hidden;
            if (!paused && !reduced && !rafId) rafId = window.requestAnimationFrame(draw);
        });

        if (reduced) {
            draw(start);
        } else {
            rafId = window.requestAnimationFrame(draw);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
