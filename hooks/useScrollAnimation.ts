"use client";
import { useEffect } from "react";

/**
 * Drives the scroll-progress bar, the `--scroll-y` parallax variable, and
 * reveal-on-scroll for `.reveal` elements.
 *
 * Mounted once at the layout level, so it must cope with client-side
 * navigation: the observer re-scans whenever the DOM changes rather than
 * only at mount, otherwise `.reveal` elements on a page reached by a Link
 * click would stay stuck at opacity 0.
 */
export function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    // Track what we've already handed to the observer so repeated scans
    // stay cheap and don't re-observe the same node.
    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        observer.observe(el);
      });
    };
    scan();

    // Re-scan on any subtree change (route transitions, Suspense boundaries
    // resolving, lists growing via "show more").
    let queued = false;
    const mutationObserver = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scan();
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const onScroll = () => {
      const scrollY = window.scrollY;
      document.documentElement.style.setProperty("--scroll-y", String(scrollY));
      const bar = document.getElementById("scroll-progress");
      if (bar) {
        const total = document.body.scrollHeight - window.innerHeight;
        bar.style.width = total > 0 ? `${(scrollY / total) * 100}%` : "0%";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}
