'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { FaGithub, FaLinkedinIn, FaMedium, FaInstagram, FaYoutube } from 'react-icons/fa'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/AboutSection.module.css'

const BIO      = profile.bio
const WHO_ITEMS = profile.skills

const ICON_MAP = { GitHub: FaGithub, LinkedIn: FaLinkedinIn, Medium: FaMedium, Instagram: FaInstagram, YouTube: FaYoutube }

const SOCIALS = profile.socials.map(s => ({ Icon: ICON_MAP[s.label], href: s.href, label: s.label }))

export default function AboutSection() {
  const sectionRef  = useRef(null)
  const photoRef    = useRef(null)
  const contentRef  = useRef(null)
  const socialsRef  = useRef(null)
  const typewriterTweenRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const scroller = document.querySelector('main')
    if (!scroller) return

    let isActive = false

    function resetAnim() {
      typewriterTweenRef.current?.kill()
      gsap.killTweensOf(photoRef.current)
      gsap.killTweensOf(contentRef.current)
      const socialIcons = socialsRef.current?.querySelectorAll('a') ?? []
      gsap.killTweensOf(socialIcons)
      gsap.set(photoRef.current,   { opacity: 0, x: -50 })
      gsap.set(contentRef.current, { opacity: 0, y:  40 })
      gsap.set(socialIcons, { opacity: 0, y: 20 })

      // Reset character classes in the DOM directly
      const charSpans = contentRef.current?.querySelectorAll('[data-char]') ?? []
      for (let j = 0; j < charSpans.length; j++) {
        charSpans[j].className = styles.untyped
      }
    }

    function playAnim() {
      resetAnim()
      gsap.to(photoRef.current,   { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' })
      gsap.to(contentRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 })
      const socialIcons = socialsRef.current?.querySelectorAll('a') ?? []
      gsap.to(socialIcons, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1, delay: 0.5 })

      const charSpans = contentRef.current?.querySelectorAll('[data-char]') ?? []
      if (charSpans.length === 0) return

      let activeIndex = -1
      const progressObj = { value: 0 }

      typewriterTweenRef.current = gsap.to(progressObj, {
        value: charSpans.length,
        duration: charSpans.length / 375,
        ease: 'none',
        delay: 0.3,
        onUpdate: () => {
          const currentIdx = Math.floor(progressObj.value)
          if (currentIdx !== activeIndex) {
            // Update previous activeIndex span to typed
            if (activeIndex >= 0 && activeIndex < charSpans.length) {
              charSpans[activeIndex].className = styles.typed
            }
            // Update intermediate spans if we skipped any
            const start = Math.min(activeIndex + 1, currentIdx)
            const end = Math.max(activeIndex + 1, currentIdx)
            for (let j = start; j < currentIdx; j++) {
              if (j >= 0 && j < charSpans.length) {
                charSpans[j].className = styles.typed
              }
            }
            // Update current span to lastTyped
            if (currentIdx >= 0 && currentIdx < charSpans.length) {
              charSpans[currentIdx].className = styles.lastTyped
            }
            activeIndex = currentIdx
          }
        },
        onComplete: () => {
          for (let j = 0; j < charSpans.length; j++) {
            charSpans[j].className = styles.typed
          }
        }
      })
    }

    resetAnim()

    function onScroll() {
      const inRange = Math.abs(scroller.scrollTop - section.offsetTop) < scroller.clientHeight * 0.5
      if (inRange && !isActive)  { isActive = true;  playAnim() }
      if (!inRange && isActive)  { isActive = false; resetAnim() }
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      typewriterTweenRef.current?.kill()
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>

      {/* ── Left: photo + signature + socials ───────── */}
      <div ref={photoRef} className={styles.photoCol}>
        <div className={styles.photoWrap}>
          <div className={styles.photoFrame} data-about-photo>
            <Image
              src="/assets/hero-section.png"
              alt={profile.name.full}
              fill
              quality={100}
              sizes="(min-width: 768px) 30vw, 100vw"
              className={styles.photoImg}
            />
          </div>
          <p className={styles.signature}>{profile.name.first}</p>
        </div>

        {/* Social icons */}
        <div ref={socialsRef} className={styles.socials}>
          {SOCIALS.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={styles.socialLink}
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>

      {/* ── Right: content ───────────────────────────── */}
      <div ref={contentRef} className={styles.content}>

        {/* Who I Am - label + infinite marquee */}
        <p className={styles.whoLabel}>Who I Am</p>
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack}>
            {[...WHO_ITEMS, ...WHO_ITEMS].map((item, i) => (
              <span key={i} className={styles.marqueeItem}>
                {item}
                <span className={styles.marqueeDot}>·</span>
              </span>
            ))}
          </div>
        </div>

        {/* Bio text - typewriter: all chars always in DOM, only color changes */}
        <div className={styles.bioWrap}>
          <p className={styles.bio}>
            {BIO.split('').map((char, i) => (
              <span
                key={i}
                data-char
                className={styles.untyped}
              >
                {char}
              </span>
            ))}
          </p>
        </div>

      </div>
    </section>
  )
}
