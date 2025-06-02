import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';

export type UseFormGsapAnimationOptions = {
  formRef: RefObject<Element | null>;
  fieldRefs: RefObject<Element | null>[];
  buttonRef: RefObject<Element | null>;
  extraRefs?: RefObject<Element | null>[]; // for checkbox, forgot, etc.
};

export function useFormGsapAnimation({
  formRef,
  fieldRefs,
  buttonRef,
  extraRefs = [],
}: UseFormGsapAnimationOptions) {
  useEffect(() => {
    if (
      formRef.current &&
      fieldRefs.every(ref => ref.current) &&
      buttonRef.current &&
      extraRefs.every(ref => ref.current)
    ) {
      const tl = gsap.timeline();
      tl.fromTo(
        formRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
      fieldRefs.forEach((ref, i) => {
        tl.fromTo(
          ref.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.38 + 0.07 * i, ease: 'power3.out' },
          i === 0 ? '-=0.35' : '-=0.32'
        );
      });
      tl.fromTo(
        buttonRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' },
        '-=0.22'
      );
      extraRefs.forEach((ref, _i) => {
        tl.fromTo(
          ref.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out' },
          '-=0.18'
        );
      });
    }
  }, []); // Only run on mount
}
