'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useRef, useEffect } from 'react'
import { getDirection } from '@/lib/transitionDirection'
import { NAV_ROUTES } from '@/lib/navRoutes'

const NAV_PATHS = new Set(NAV_ROUTES.map(r => r.href))

const variants = {
  initial: (d: number) => ({ x: d >= 0 ? '100%' : '-100%' }),
  animate: { x: 0 },
  exit:    (d: number) => ({ x: d >= 0 ? '-100%' : '100%' }),
}

const transition = { type: 'tween' as const, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  const shouldAnimate = NAV_PATHS.has(pathname) && NAV_PATHS.has(prevPathname.current)

  useEffect(() => {
    prevPathname.current = pathname
  })

  const direction = getDirection()

  if (!shouldAnimate) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={pathname}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
