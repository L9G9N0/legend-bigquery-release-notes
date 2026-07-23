# PROMPT.md --- Yogi Timer (Production Engineering Specification)

> **Repository:** https://github.com/L9G9N0/yogi_timer

## Mission

You are acting as a Principal macOS Engineer, Staff SwiftUI Engineer,
Product Designer, QA Engineer, Performance Engineer, Security Engineer,
DevOps Engineer, Release Engineer and Technical Writer.

Your objective is **not** to build a countdown timer.

Your objective is to build a **production-quality native macOS focus
companion** that feels like an Apple application and could eventually be
published after final polishing.

The application philosophy is:

-   Time is always visible.
-   Time continuously reminds the user that every second matters.
-   The interface never distracts the user.
-   Every design decision should encourage focus rather than
    productivity overload.

------------------------------------------------------------------------

# Engineering Rules

1.  Read the entire repository before changing code.
2.  Review every source file, dependency, build setting and Git history.
3.  Create a project audit before implementation.
4.  Never rewrite working code without reason.
5.  Never hallucinate completed features.
6.  Verify every feature before marking it complete.
7.  If macOS permissions or entitlements are required, STOP and explain
    exactly what manual steps I must perform.

------------------------------------------------------------------------

# Product Vision

Yogi Timer is **not a stopwatch**.

It is a constant visual reminder that life is finite.

The countdown should quietly exist in the corner of the screen while
users study, code, write, prepare for interviews or work.

It should never become visually noisy.

The application should feel calm, elegant and minimal.

Users should instinctively trust it enough to keep it running all day.

------------------------------------------------------------------------

# UI Philosophy

-   Native macOS appearance
-   Black background
-   White countdown digits
-   Minimal typography
-   No gradients
-   No flashy animations
-   Small floating window
-   Rounded corners
-   Professional spacing
-   Smooth resizing
-   Dark-first design

------------------------------------------------------------------------

# Core Features

## Countdown Timer

Implement a highly accurate decrement timer.

Support:

-   Start
-   Pause
-   Resume
-   Reset
-   Custom duration
-   Keyboard shortcuts

The timer must survive window minimize and application restart.

------------------------------------------------------------------------

## Floating Window

Allow:

-   Top Left
-   Top Right
-   Bottom Left
-   Bottom Right
-   Custom position

Support:

-   Always on top
-   Multiple monitors
-   Fullscreen apps
-   Mission Control
-   Window persistence

------------------------------------------------------------------------

## Focus Mode

Implement an optional focus mode inspired by coding assessment
platforms.

When enabled:

-   Show a blocking overlay.
-   Keep the countdown visible.
-   Prevent casual interaction with other applications where technically
    possible.

If macOS restrictions prevent full implementation:

-   Explain the restriction.
-   Request Accessibility permissions if required.
-   Request Screen Recording permission if required.
-   Describe the exact manual steps needed.

Never fake system-level capabilities.

------------------------------------------------------------------------

## Task System

Provide a lightweight task manager.

Each task:

-   title
-   note
-   deadline
-   completed state

Allow users to choose whether tasks appear beside the timer.

Persist all tasks locally.

------------------------------------------------------------------------

## Reminder System

Support reminders with:

-   notification
-   sound
-   optional fullscreen warning
-   customizable accent color

Explain any Notification permission required.

------------------------------------------------------------------------

# Engineering Quality

Use:

-   Clean Architecture
-   Modular code
-   Reusable SwiftUI components
-   Dependency injection where appropriate
-   Structured logging
-   Graceful error handling

Optimize for:

-   Low CPU
-   Low RAM
-   Minimal battery usage

------------------------------------------------------------------------

# Documentation

Generate:

-   README.md
-   SYSTEM_ARCHITECTURE.md
-   CHANGELOG.md
-   ROADMAP.md
-   CONTRIBUTING.md
-   SETUP.md

Document every important engineering decision.

------------------------------------------------------------------------

# Git Workflow

Never create one massive commit.

Instead:

-   One feature
-   Verify
-   Commit
-   Repeat

Write realistic professional commit messages.

Keep Git history natural.

------------------------------------------------------------------------

# Testing

Verify:

-   Countdown accuracy
-   Floating window
-   Persistence
-   Focus Mode
-   Reminder scheduling
-   Task storage
-   Multi-monitor behavior
-   Apple Silicon compatibility
-   Crash recovery
-   Error handling

Do not claim success until every item has been verified.

------------------------------------------------------------------------

# Final Rule

Whenever you cannot continue because of permissions, Apple certificates,
Xcode settings, Accessibility, Notifications, Login Items or system
restrictions:

STOP.

Explain:

1.  What is missing.
2.  Why it is required.
3.  Exact manual steps.
4.  Expected result.

Only continue after those steps are completed.
