"use client";
// Carousel — autoplaying, looping slideshow (ported from the Brahma carousel).
//
// Each slide is held for CAROUSEL_HOLD_MS, then slides to the next over the
// SCSS `$change-time`. Unlike the original, timers live inside each instance
// and are cleared on unmount (many carousels can share a page), one timer
// chain drives hold → slide → commit (no racing intervals), and users who
// prefer reduced motion get a static first slide.
import { useEffect, useState } from "react";

import { classNames } from "@/utils/classnames";
import {
  CAROUSEL_COMMIT_MS,
  CAROUSEL_HOLD_MS,
  REDUCED_MOTION_QUERY,
} from "./Carousel.constant";
import styles from "./Carousel.module.scss";
import type { CarouselProps } from "./Carousel.types";

function Carousel({ items, className }: CarouselProps) {
  const count = items.length;
  const [index, setIndex] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  // A different number of slides restarts from the first one.
  useEffect(() => {
    setIndex(0);
    setIsMoving(false);
  }, [count]);

  // Hold the current slide, start the slide animation, then commit the next
  // slide once the animation has finished.
  useEffect(() => {
    if (count < 2 || window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      return undefined;
    }
    const timer = isMoving
      ? setTimeout(() => {
          setIsMoving(false);
          setIndex((current) => (current + 1) % count);
        }, CAROUSEL_COMMIT_MS)
      : setTimeout(() => setIsMoving(true), CAROUSEL_HOLD_MS);
    return () => clearTimeout(timer);
  }, [count, index, isMoving]);

  if (count === 0) {
    return null;
  }

  // The clone of the first slide lets the last slide slide "forward" into it.
  const slides = count > 1 ? [...items, items[0]] : items;

  return (
    <div className={classNames(styles.container, className)}>
      <div
        className={classNames(
          styles.track,
          styles[`at${index}`],
          isMoving ? styles.move : undefined,
        )}
      >
        {slides.map((item, slideIndex) => (
          <div
            // Slides are positional; the clone shares content with slide 0.
            key={slideIndex}
            className={styles.slide}
            aria-hidden={slideIndex !== index}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Carousel;
