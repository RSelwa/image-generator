"use mobile"

import { StripHorizontal, StripVertical } from '@/components/icons'
import { useIsMobile } from '@/hooks/use-mobile'
import React from 'react'


export const HomeStrips = () => (
    <article className="bg-primary text-primary-foreground absolute mb mt-auto h-15 w-full lg:w-15  lg:h-full left-0 lg:top-0 bottom-0">
        <StripVertical className="hidden lg:block w-9 absolute left-1/2 bottom-4 -translate-x-1/2" />
        <StripHorizontal className="block lg:hidden h-9 absolute top-1/2 left-4 -translate-y-1/2" />
    </article>
)

