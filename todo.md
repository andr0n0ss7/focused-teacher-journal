# Project TODO

- [x] Refine the planner into an elegant, polished all-in-one teacher workspace
- [x] Persist teacher identity: name, subjects, up to 8 classes, year, and term
- [x] Persist and edit bell schedule periods, times, classes, rooms, and transition notes
- [x] Build monthly bird’s-eye spread with all 8 classes, deadlines, holidays, and extra tasks
- [x] Build weekly command center with big-three priorities, daily lesson/prep notes, student follow-up, grading, meetings, and one-next-step columns
- [x] Build daily page with today’s schedule, quick capture, energy check-in, and exact Notice / Adjust / Close prompts
- [x] Persist one editable daily entry per date, including past entries
- [x] Build grading tracker with exact statuses: Collected, Missing, Late, Reviewed, Returned
- [x] Build persistent student or group notes with strengths, evidence, support needs, student voice, next action, and review date
- [x] Build persistent parent/carer contact log with reason, summary, agreement, and follow-up date
- [x] Build emergency procedures and important contacts page with editable school data
- [x] Build supplementary pages: resource index, meeting notes, substitute/handover notes, professional learning log, and free notes
- [x] Enforce an 8-class cap consistently across UI, validation, and persistence
- [x] Add responsive navigation and accessible empty/loading/error states
- [x] Add Vitest coverage for planner persistence and validation behavior
- [x] Verify visual quality and interaction states; procedure-level persistence tests pass

# Review follow-ups

- [x] Render saved supplementary entries with full edit/delete controls
- [x] Add explicit planner load/save error UI and recoverable hydration behavior
- [x] Add Vitest coverage for planner get/save/reset persistence round trips
- [ ] Manually verify authenticated planner workflows end-to-end where browser access permits
- [x] Refine section differentiation so the product reads clearly as a teacher journal rather than a generic dashboard

# Reported deployment bugs

- [x] Fix sidebar navigation so each planner section changes the visible workspace in the deployed app
- [x] Diagnose published-site authentication/login failure: live logs show missing session cookies but no OAuth callback failure; the published domain is currently routing through the Manus access gate
- [ ] Verify navigation and authentication on the published domain

# Class roster enhancement

- [x] Add persistent class member lists for each configured class
- [x] Make class cards clickable and open the selected class roster
- [x] Support adding, renaming, and removing class members within the eight-class limit
- [x] Connect roster members to student notes and keep the workflow editable
- [x] Test roster persistence, class selection, validation, and responsive presentation

# Roster-to-student-notes linkage

- [x] Add stable member identifiers to roster entries while preserving existing names
- [x] Store a linked roster member ID on each student note
- [x] Make student-note selection class-filtered and roster-driven
- [x] Display the linked roster member and class consistently on saved notes
- [x] Preserve compatibility for older notes that only contain a typed student name
- [x] Test linked note creation, roster rename behavior, and persistence

# Individual learner workspace

- [x] Make each roster member on Identity setup clickable and route to that learner’s Student Notes view
- [x] Add an individual learner context to the Student Notes page with class and member identity
- [x] Show the learner’s notes in the individual view and keep them editable/persistent
- [x] Move parent/carer contact details into the individual learner view
- [x] Hide parent/carer contacts behind an intentionally expandable details panel
- [x] Preserve existing linked roster-member IDs and older student-note compatibility
- [x] Test member-click navigation, individual note filtering, expandable contacts, and persistence

# Individual learner integration follow-ups

- [x] Add edit controls for existing student notes in the individual learner view and verify changes persist
- [x] Link parent/carer contact creation to rosterMemberId from the learner context and preserve it through renames
- [x] Add verifiable coverage for member-click navigation, learner filtering, expandable contacts, and linked-contact persistence

# Final learner-flow verification

- [x] Add an existing-note edit round-trip test
- [x] Pass a stable memberId into the parent-contact route and use it directly
- [x] Add pure coverage for learner navigation URL and individual note/contact filtering
