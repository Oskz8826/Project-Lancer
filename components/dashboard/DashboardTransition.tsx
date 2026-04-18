'use client'

import { motion } from 'framer-motion'

export default function DashboardTransition({ children, style }: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: 'linear' }}
      style={style}
    >
      {children}
    </motion.div>
  )
}
