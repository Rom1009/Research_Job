'use client'

import { useContext } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeContext } from '@/components/theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="w-10 h-10"
    >
      {theme === 'dark' ? (
        <Sun data-icon="inline-start" className="size-5" />
      ) : (
        <Moon data-icon="inline-start" className="size-5" />
      )}
    </Button>
  )
}
