// src/lib/actions/highlight-card.svelte.ts
import type { Action } from 'svelte/action'

interface HighlightCardOptions {
  isHighlighted?: boolean
  duration?: number
  shimmerDuration?: number
}

type HighlightStart = CustomEvent<{ duration: number; shimmerDuration: number }>
type HighlightEnd = CustomEvent<{ duration: number; shimmerDuration: number }>

export const highlightCard: Action<
  HTMLElement,
  HighlightCardOptions,
  {
    'on:highlight-start': (e: HighlightStart) => void
    'on:highlight-end': (e: HighlightEnd) => void
  }
> = (node, options = {}) => {
  let { isHighlighted = false, duration = 1400, shimmerDuration = 800 } = options
  let timeoutId: number | undefined
  let isActive = false
  let isExiting = false
  let mounted = false
  let injectedTransform = false
  let activeShimmerDuration = 0
  let observer: IntersectionObserver | null = null

  const doc = typeof document !== 'undefined' ? document : null

  // Check for reduced motion once (SSR-safe)
  const reducedMotion =
    typeof window !== 'undefined' &&
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches

  const injectStyles = () => {
    if (!doc || doc.getElementById('highlight-card-styles')) return
    const s = doc.createElement('style')
    s.id = 'highlight-card-styles'
    s.textContent = `
      .highlight-card-active {
        --highlight-accent-rgb: var(--accent-rgb, 108,98,208);
        
        /* GPU layer without scale blur */
        will-change: auto;
        transform: translateZ(0);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        
        /* Tight containment */
        contain: paint;
        isolation: isolate;
        
        /* Static shadow - no animation cost */
        box-shadow: 
          0 0 0 1px rgba(var(--highlight-accent-rgb), 0.18),
          0 2px 8px rgba(var(--highlight-accent-rgb), 0.10);
        
        position: relative;
        overflow: hidden;
      }

      /* Glow layer - handles all fading */
      .highlight-card-active::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: inherit;
        
        /* Tight radial gradient */
        background: radial-gradient(ellipse 70% 50% at 50% 50%, 
          rgba(var(--highlight-accent-rgb), 0.12) 0%, 
          rgba(var(--highlight-accent-rgb), 0.06) 35%,
          transparent 65%);
        
        z-index: 0;
        will-change: opacity;
        transform: translateZ(0);
        backface-visibility: hidden;
        
        opacity: 1;
        pointer-events: none;
        transition: opacity 160ms ease;
      }

      /* Shimmer layer - conditional */
      .highlight-card-active::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        
        /* Lightweight shimmer */
        background: linear-gradient(90deg,
          transparent 0%,
          rgba(255,255,255, 0.2) 48%,
          rgba(255,255,255, 0.35) 50%,
          rgba(255,255,255, 0.2) 52%,
          transparent 100%);
        
        z-index: 1;
        will-change: transform;
        transform: translateZ(0) translateX(-100%);
        backface-visibility: hidden;
        
        animation: highlight-shimmer var(--shimmer-duration, 800ms) ease-out forwards;
        pointer-events: none;
        
        /* Hide shimmer if duration is 0 */
        display: var(--shimmer-display, block);
      }

      /* Content layer */
      .highlight-card-active > * { 
        position: relative; 
        z-index: 2;
      }

      /* Exit - no box-shadow transition cost */
      .highlight-card-exit {
        transition: none;
      }
      
      .highlight-card-exit::after { 
        opacity: 0;
        transition: opacity 160ms ease;
      }

      /* Hardware-accelerated shimmer */
      @keyframes highlight-shimmer {
        to { 
          transform: translateZ(0) translateX(100%);
        }
      }

      /* Mobile optimizations */
      @media (max-width: 768px) {
        .highlight-card-active {
          box-shadow: 
            0 0 0 1px rgba(var(--highlight-accent-rgb), 0.15),
            0 1px 6px rgba(var(--highlight-accent-rgb), 0.08);
        }
        
        .highlight-card-active::after {
          background: radial-gradient(circle at 50% 50%, 
            rgba(var(--highlight-accent-rgb), 0.08) 0%, 
            transparent 55%);
        }
      }

      /* Reduced motion fallback */
      @media (prefers-reduced-motion: reduce) {
        .highlight-card-active { 
          box-shadow: 0 0 0 2px rgba(var(--highlight-accent-rgb), 0.25);
        }
        .highlight-card-active::before { 
          display: none;
        }
        .highlight-card-active::after { 
          opacity: 0.4;
          background: rgba(var(--highlight-accent-rgb), 0.06);
        }
      }
    `
    doc.head.appendChild(s)
  }

  const cleanup = () => {
    node.style.removeProperty('--shimmer-duration')
    node.style.removeProperty('--shimmer-display')
    if (injectedTransform) {
      node.style.transform = ''
      injectedTransform = false
    }
    if (!isActive && !isExiting) {
      node.style.willChange = 'auto'
    }
  }

  const handleTransitionEnd = (e: TransitionEvent) => {
    if (e.target !== node || !isExiting) return

    isExiting = false
    node.classList.remove('highlight-card-active', 'highlight-card-exit')
    node.removeEventListener('transitionend', handleTransitionEnd)

    cleanup()

    node.dispatchEvent(
      new CustomEvent('highlight-end', {
        detail: { duration, shimmerDuration: activeShimmerDuration },
      }),
    )
  }

  const startHighlight = () => {
    if (isActive || isExiting || !mounted) return
    isActive = true

    // Apply reduced motion override
    activeShimmerDuration = reducedMotion ? 0 : shimmerDuration

    // Store for consistent event emission

    // Pre-promote to composite layer
    node.style.willChange = 'auto'

    // Only add transform if none exists
    if (!node.style.transform) {
      node.style.transform = 'translateZ(0)'
      injectedTransform = true
    }

    // Configure shimmer
    node.style.setProperty('--shimmer-duration', `${Math.max(0, activeShimmerDuration)}ms`)
    if (activeShimmerDuration <= 0) {
      node.style.setProperty('--shimmer-display', 'none')
    }

    requestAnimationFrame(() => {
      node.classList.add('highlight-card-active')

      node.dispatchEvent(
        new CustomEvent('highlight-start', {
          detail: { duration, shimmerDuration: activeShimmerDuration },
        }),
      )
    })

    timeoutId = window.setTimeout(endHighlight, duration)
  }

  const endHighlight = () => {
    if (!isActive || isExiting) return
    isActive = false
    isExiting = true

    node.addEventListener('transitionend', handleTransitionEnd, { once: true })

    requestAnimationFrame(() => {
      node.classList.add('highlight-card-exit')
    })

    // Fallback cleanup - 160ms transition + 120ms buffer
    setTimeout(() => {
      if (isExiting) {
        node.removeEventListener('transitionend', handleTransitionEnd)
        // Create proper TransitionEvent for fallback
        const fallbackEvent = new Event('transitionend') as TransitionEvent
        Object.defineProperty(fallbackEvent, 'target', { value: node })
        handleTransitionEnd(fallbackEvent)
      }
    }, 280)

    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  }

  injectStyles()

  const initializeHighlight = () => {
    mounted = true
    if (isHighlighted) {
      requestAnimationFrame(startHighlight)
    }
  }

  // Safe pixel-based rootMargin for Android WebViews
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer?.disconnect()
          observer = null
          initializeHighlight()
        }
      },
      {
        threshold: 0,
        rootMargin: '120px 0px',
      },
    )
    observer.observe(node)
  } else {
    setTimeout(initializeHighlight, 16)
  }

  return {
    update(next) {
      const prev = isHighlighted
      isHighlighted = next.isHighlighted ?? isHighlighted
      duration = next.duration ?? duration
      shimmerDuration = next.shimmerDuration ?? shimmerDuration

      if (mounted) {
        if (isHighlighted && !prev && !isActive && !isExiting) {
          requestAnimationFrame(startHighlight)
        } else if (!isHighlighted && prev) {
          endHighlight()
        }
      }
    },

    destroy() {
      // Hard cleanup - no new listeners
      if (timeoutId) clearTimeout(timeoutId)
      observer?.disconnect()
      observer = null
      node.classList.remove('highlight-card-active', 'highlight-card-exit')
      node.removeEventListener('transitionend', handleTransitionEnd)
      isActive = false
      isExiting = false
      mounted = false
      cleanup()
    },
  }
}
