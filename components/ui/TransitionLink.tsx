'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentProps } from 'react'
import { setDirection } from '@/lib/transitionDirection'
import { getRouteDepth } from '@/lib/navRoutes'

type Props = ComponentProps<typeof Link>

export default function TransitionLink({ href, onClick, ...props }: Props) {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      onClick={(e) => {
        const from = getRouteDepth(pathname)
        const to = getRouteDepth(href.toString())
        setDirection(to - from)
        if (onClick) onClick(e)
      }}
      {...props}
    />
  )
}
