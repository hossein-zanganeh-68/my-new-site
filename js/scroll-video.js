/* ============================================
   SCROLL-DRIVEN HERO VIDEO
   — Scroll position controls video.currentTime
   — No autoplay, no play(), no loop
   — requestAnimationFrame + smooth interpolation
   ============================================

   VIDEO ENCODING NOTES:
   For smooth random-access seeking the video should have:
   - Frequent keyframes (every 1–2s ideally)
   - H.264 MP4 with web-optimised moov atom (faststart)
   - Reasonable bitrate (this file is ~3.6 MB, well within budget)
   - No excessive resolution — 1080p max for cover; lower for mobile is fine
   If the supplied video stutters during seeking, re-encode with:
     ffmpeg -i input.mp4 -movflags +faststart -g 30 -keyint_min 30 \
       -preset slow -crf 22 -vf "scale=1920:-2" output.mp4
   (-g 30 places a keyframe every ~30 frames; +faststart moves moov to front)
   ============================================ */

(function () {
  'use strict';

  var heroSection = document.querySelector('.hero-scroll-section');
  var video = document.getElementById('heroVideo');
  var heroLoading = document.getElementById('heroLoading');
  var heroContent = document.getElementById('heroContent');
  var scrollIndicator = document.getElementById('heroScrollIndicator');

  if (!heroSection || !video) return;

  /* ---- Reduced-motion: static fallback, no scroll scrubbing ---- */
  var prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    video.style.display = 'none';
    if (heroLoading) heroLoading.style.display = 'none';
    // CSS .hero-fallback background image is visible underneath
    return;
  }

  /* ---- State ---- */
  var videoDuration = 0;
  var targetProgress = 0;
  var currentVideoTime = 0;
  var isReady = false;
  var rafId = null;

  // Smoothing factor — lower = smoother but more lag, higher = more responsive.
  // 0.12 keeps it tightly connected to scroll while avoiding harsh jumps.
  var SMOOTHING = 0.12;
  // Only seek when the delta exceeds this (seconds) — prevents seek flooding.
  var MIN_SEEK_DELTA = 0.008;
  // If the gap between current and target is very large (fast scroll),
  // jump directly instead of interpolating — avoids long catch-up lag.
  var SNAP_THRESHOLD = 0.4;

  /* ---- Video event handlers ---- */
  function onLoadedMetadata() {
    videoDuration = video.duration;
    if (!isFinite(videoDuration) || videoDuration <= 0) {
      onVideoError();
      return;
    }
    // Seek to first frame so the opening shot is visible immediately
    try { video.currentTime = 0; } catch (e) {}
  }

  function onCanPlayThrough() {
    if (isReady) return;
    isReady = true;
    video.classList.add('ready');
    if (heroLoading) heroLoading.classList.add('hidden');
    startAnimation();
  }

  function onVideoError() {
    if (isReady) return;
    // Hide video, show fallback background (already in DOM via .hero-fallback)
    video.style.display = 'none';
    if (heroLoading) heroLoading.classList.add('hidden');
    heroSection.classList.add('video-failed');
  }

  /* ---- Scroll handler: ONLY updates target progress (passive, cheap) ---- */
  function onScroll() {
    var rect = heroSection.getBoundingClientRect();
    var scrollable = heroSection.offsetHeight - window.innerHeight;
    if (scrollable <= 0) {
      targetProgress = 0;
      return;
    }
    var scrolled = -rect.top;
    targetProgress = Math.max(0, Math.min(1, scrolled / scrollable));
  }

  /* ---- RAF loop: smooth interpolation + video seeking ---- */
  function tick() {
    if (isReady && videoDuration > 0) {
      var targetTime = targetProgress * videoDuration;
      var diff = targetTime - currentVideoTime;

      if (Math.abs(diff) > SNAP_THRESHOLD) {
        // Fast scroll — snap directly to avoid lag
        currentVideoTime = targetTime;
      } else {
        // Smooth interpolation toward target
        currentVideoTime += diff * SMOOTHING;
      }

      // Only write to video when the change is meaningful
      var videoDelta = Math.abs(currentVideoTime - video.currentTime);
      if (videoDelta > MIN_SEEK_DELTA) {
        try { video.currentTime = currentVideoTime; } catch (e) {}
      }

      // Gradually fade hero text as the user scrolls (gone by ~36% progress)
      var textOpacity = Math.max(0, 1 - targetProgress * 2.8);
      if (heroContent) heroContent.style.opacity = textOpacity;
      if (scrollIndicator) scrollIndicator.style.opacity = textOpacity * 0.7;
    }

    rafId = requestAnimationFrame(tick);
  }

  function startAnimation() {
    if (rafId) return;
    rafId = requestAnimationFrame(tick);
  }

  /* ---- Init ---- */
  video.addEventListener('loadedmetadata', onLoadedMetadata);
  video.addEventListener('canplaythrough', onCanPlayThrough);
  video.addEventListener('error', onVideoError);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll(); // set initial state

  // Timeout fallback: if video hasn't become ready in 10s, use image fallback
  setTimeout(function () {
    if (!isReady) onVideoError();
  }, 10000);
})();
