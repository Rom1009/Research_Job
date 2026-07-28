"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_KEY = "onboarding-completed-v1";

export function OnboardingTour() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(TOUR_KEY)) return;

    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        onDestroyed: () => {
          localStorage.setItem(TOUR_KEY, "1");
        },
        steps: [
          {
            element: '[data-tour="sidebar-profile"]',
            popover: {
              title: "Step 1 — Set up your profile",
              description:
                "Upload CV + connect GitHub. AI will extract your skills automatically.",
              side: "right",
            },
          },
          {
            element: '[data-tour="sidebar-jobs"]',
            popover: {
              title: "Step 2 — Find jobs",
              description: "Scrape jobs from LinkedIn matching your keywords.",
              side: "right",
            },
          },
          {
            element: '[data-tour="sidebar-analysis"]',
            popover: {
              title: "Step 3 — See your matches",
              description:
                "Deep insights: skills radar, gap analysis, and advice per role.",
              side: "right",
            },
          },
        ],
      });

      driverObj.drive();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
