import { useEffect, RefObject } from 'react'
import gsap from 'gsap'

interface SidebarAnimationRefs {
  headerRef: RefObject<HTMLDivElement | null>
  logoRef: RefObject<HTMLImageElement | null>
  navigationRef: RefObject<HTMLDivElement | null>
  menuItemsRef: RefObject<HTMLLIElement[]>
  profileRef: RefObject<HTMLDivElement | null>
}

interface SidebarAnimationOptions {
  isLoaded: boolean
  selectedIndex: number
  onLoadComplete: () => void
}

interface ThemeType {
  palette: {
    error: {
      light: string
    }
    grey: {
      100: string
    }
  }
}

export const useSidebarGsapAnimation = (
  refs: SidebarAnimationRefs,
  options: SidebarAnimationOptions
) => {
  const { headerRef, logoRef, navigationRef, menuItemsRef, profileRef } = refs
  const { isLoaded, selectedIndex, onLoadComplete } = options

  // Entrance animations
  useEffect(() => {
    if (!isLoaded) {
      const tl = gsap.timeline()

      // Animate header
      if (headerRef.current) {
        tl.fromTo(
          headerRef.current,
          { y: -100, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }
        )
      }

      // Animate logo with rotation
      if (logoRef.current) {
        tl.fromTo(
          logoRef.current,
          { scale: 0, rotation: -180 },
          { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.4'
        )
      }

      // Animate navigation section
      if (navigationRef.current) {
        tl.fromTo(
          navigationRef.current,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          '-=0.3'
        )
      }

      // Animate menu items with stagger
      if (menuItemsRef.current && menuItemsRef.current.length > 0) {
        tl.fromTo(
          menuItemsRef.current,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power2.out',
          },
          '-=0.2'
        )
      }

      // Animate profile section
      if (profileRef.current) {
        tl.fromTo(
          profileRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.1'
        )
      }

      // Call completion callback
      tl.call(onLoadComplete)
    }
  }, [isLoaded, headerRef, logoRef, navigationRef, menuItemsRef, profileRef, onLoadComplete])

  // Reset animations when selection changes
  useEffect(() => {
    if (menuItemsRef.current) {
      menuItemsRef.current.forEach((item, i) => {
        if (item && i !== selectedIndex) {
          gsap.killTweensOf(item)
          gsap.set(item, {
            x: 0,
            scale: 1,
            opacity: 1,
          })
        }
      })
    }
  }, [selectedIndex, menuItemsRef])

  // Menu item hover animation
  const handleMenuItemHover = (index: number, isHovering: boolean) => {
    if (menuItemsRef.current && menuItemsRef.current[index]) {
      const item = menuItemsRef.current[index]
      if (item && index !== selectedIndex) {
        // Kill any existing animations on this item
        gsap.killTweensOf(item)

        gsap.to(item, {
          x: isHovering ? 6 : 0,
          scale: isHovering ? 1.02 : 1,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }
  }

  // Menu item selection animation
  const handleMenuItemClick = (index: number, onSelectionChange: (index: number) => void) => {
    if (index === selectedIndex) return

    if (menuItemsRef.current) {
      // Reset all menu items to default state first
      menuItemsRef.current.forEach((item) => {
        if (item) {
          gsap.set(item, {
            x: 0,
            scale: 1,
            opacity: 1,
          })
        }
      })

      // GSAP animation for menu selection
      const currentItem = menuItemsRef.current[selectedIndex]
      const newItem = menuItemsRef.current[index]

      if (currentItem && newItem) {
        // Animate current item out
        gsap.to(currentItem, {
          scale: 0.85,
          opacity: 0.7,
          duration: 0.2,
          ease: 'power2.out',
          onComplete: () => {
            onSelectionChange(index)
            // Animate new item in
            gsap.fromTo(
              newItem,
              { scale: 0.85, opacity: 0.7 },
              { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
            )
          },
        })
      } else {
        onSelectionChange(index)
      }
    }
  }

  // Menu item mouse down reset
  const handleMenuItemMouseDown = (index: number) => {
    if (menuItemsRef.current && menuItemsRef.current[index]) {
      const item = menuItemsRef.current[index]
      if (item) {
        gsap.killTweensOf(item)
      }
    }
  }

  // Profile hover animation
  const handleProfileHover = (isHovering: boolean) => {
    if (profileRef.current) {
      gsap.to(profileRef.current, {
        y: isHovering ? -4 : 0,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }

  // Logout animation
  const handleLogout = (onLogout: () => void) => {
    if (profileRef.current) {
      gsap.to(profileRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: () => onLogout(),
      })
    } else {
      onLogout()
    }
  }

  // Logout button hover animation
  const handleLogoutButtonHover = (element: HTMLElement, isHovering: boolean, theme: ThemeType) => {
    gsap.to(element, {
      scale: isHovering ? 1.05 : 1,
      backgroundColor: isHovering ? theme.palette.error.light : theme.palette.grey[100],
      duration: 0.2,
      ease: 'power2.out',
    })
  }

  return {
    handleMenuItemHover,
    handleMenuItemClick,
    handleMenuItemMouseDown,
    handleProfileHover,
    handleLogout,
    handleLogoutButtonHover,
  }
}
