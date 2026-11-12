"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children straight into `<body>`.
 *
 * Full-screen overlays need this because `Reveal` leaves `transform:
 * translateY(0)` on its wrapper once a section has animated in, and a
 * transformed ancestor becomes the containing block for any `position: fixed`
 * descendant. `fixed inset-0` then resolves against that section rather than
 * the viewport, and what should cover the screen appears as a panel floating
 * in the middle of the page.
 *
 * Mounting is deferred a tick because `document` does not exist while the
 * page is being prerendered.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
