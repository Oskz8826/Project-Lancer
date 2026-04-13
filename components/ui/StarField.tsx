'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  alpha: number
  delta: number
}

interface ShootingStar {
  x: number
  y: number
  vx: number
  vy: number
  length: number
  alpha: number
  active: boolean
}

const STAR_COUNT = 200
const SHOOTING_INTERVAL_MIN = 3000
const SHOOTING_INTERVAL_MAX = 8000

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let shootingTimer: ReturnType<typeof setTimeout>

    const stars: Star[] = []
    let shooting: ShootingStar | null = null

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function initStars() {
      if (!canvas) return
      stars.length = 0
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.2,
          alpha: Math.random(),
          delta: (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        })
      }
    }

    function spawnShootingStar() {
      if (!canvas) return
      shooting = {
        x: Math.random() * canvas.width * 0.7,
        y: Math.random() * canvas.height * 0.4,
        vx: 6 + Math.random() * 4,
        vy: 2 + Math.random() * 3,
        length: 80 + Math.random() * 60,
        alpha: 1,
        active: true,
      }
    }

    function scheduleShootingStar() {
      const delay = SHOOTING_INTERVAL_MIN + Math.random() * (SHOOTING_INTERVAL_MAX - SHOOTING_INTERVAL_MIN)
      shootingTimer = setTimeout(() => {
        spawnShootingStar()
        scheduleShootingStar()
      }, delay)
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Twinkle stars
      for (const star of stars) {
        star.alpha += star.delta
        if (star.alpha <= 0 || star.alpha >= 1) star.delta *= -1
        star.alpha = Math.max(0, Math.min(1, star.alpha))

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`
        ctx.fill()
      }

      // Shooting star
      if (shooting && shooting.active) {
        const tail = {
          x: shooting.x - (shooting.vx / Math.hypot(shooting.vx, shooting.vy)) * shooting.length,
          y: shooting.y - (shooting.vy / Math.hypot(shooting.vx, shooting.vy)) * shooting.length,
        }
        const grad = ctx.createLinearGradient(tail.x, tail.y, shooting.x, shooting.y)
        grad.addColorStop(0, `rgba(255,255,255,0)`)
        grad.addColorStop(1, `rgba(255,255,255,${shooting.alpha})`)

        ctx.beginPath()
        ctx.moveTo(tail.x, tail.y)
        ctx.lineTo(shooting.x, shooting.y)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.stroke()

        shooting.x += shooting.vx
        shooting.y += shooting.vy
        shooting.alpha -= 0.015

        if (shooting.alpha <= 0 || shooting.x > canvas.width || shooting.y > canvas.height) {
          shooting = null
        }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    initStars()
    spawnShootingStar()
    scheduleShootingStar()
    draw()

    window.addEventListener('resize', () => { resize(); initStars() })

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(shootingTimer)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} id="star-canvas" aria-hidden="true" />
}
