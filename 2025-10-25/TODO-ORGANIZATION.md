# TODO Organization for slides.md

This document organizes all TODO items found in slides.md (45 total) and provides an execution plan.

## Summary Statistics
- **Total TODOs**: 45
- **High Priority** (Critical for presentation): 8
- **Medium Priority** (Important but not blocking): 15
- **Low Priority** (Nice to have): 12
- **Optional/Questionable** (Consider dropping): 10

---

## TODOs by Category

### 1. Content Structure & Organization (High Priority)

#### About Me Section (Lines 16-17)
- **TODO**: Move "about me" after intro?
- **TODO**: Add github avatar, voidzero logo
- **Priority**: Medium
- **Effort**: Low
- **Recommendation**: Keep "About Me" early to establish credibility. Add visual elements (avatar, logo) for better engagement.

#### Talk Overview Section (Lines 141-157)
- **TODO**: Reverse? package -> features? (e.g., @vitest/expect -> assertion API)
- **TODO**: Package dependency as hierarchy?
- **TODO**: Code, server-client, architecture here?
- **Priority**: High
- **Effort**: Medium
- **Recommendation**: Critical for talk clarity. Decide on structure: either bottom-up (packages → features) or top-down (features → packages). Bottom-up might be easier to follow.

#### Test Framework Features Section (Lines 258-259)
- **TODO**: Back to "Talk Overview" slide? what to elaborate here?
- **TODO**: Should we change the order "top to bottom"?
- **Priority**: High
- **Effort**: Low
- **Recommendation**: This section seems redundant with "Talk Overview". Consider removing or merging with overview.

---

### 2. Visual Enhancements (Medium Priority)

#### What is Vitest Section (Lines 62, 78-79)
- **TODO**: Use ascii snippet?
- **TODO**: Code on the right
- **TODO**: More icon
- **Priority**: Medium
- **Effort**: Low
- **Recommendation**: Adding icons and better layout improves visual appeal. Quick wins for presentation quality.

#### Lifecycle Section (Lines 193-194, 232-235)
- **TODO**: CLI, config, sample test, output
- **TODO**: Layout, ascii snippet
- **TODO**: Clicks, highlight
- **TODO**: Map each step with reporter duration
- **TODO**: Map each step with incremental reporter output
- **TODO**: This is kinda "visible" part. it doesn't include worker etc.
- **Priority**: High
- **Effort**: Medium
- **Recommendation**: Critical for understanding. Interactive elements (clicks, highlights) make the lifecycle concrete. Consider progressive disclosure.

#### Architecture Diagram (Line 383)
- **TODO**: Diagram
- **Priority**: High
- **Effort**: Medium-High
- **Recommendation**: Essential for understanding client-server architecture. Worth the time investment.

---

### 3. Code Examples & Demonstrations (Medium Priority)

#### Interactive Code Transformations (Lines 102, 114)
- **TODO**: Morph the code into jsdom vue
- **TODO**: Morph the code into browser mode vue
- **Priority**: Low
- **Effort**: Medium
- **Recommendation**: Nice to show progression, but not critical. Consider if time permits.

#### Test Runner Section (Line 242)
- **TODO**: Highlight which part is executed. it's not "..."
- **Priority**: Medium
- **Effort**: Low
- **Recommendation**: Important for clarity. Simple visual enhancement.

#### Module Runner Code (Line 451)
- **TODO**: Before / after code snippet
- **Priority**: Medium
- **Effort**: Low
- **Recommendation**: Already have example below. Consider if additional context helps.

---

### 4. Additional Context & Attribution (Low Priority)

#### Expect API Section (Lines 270, 276)
- **TODO**: Jest icon, chai icon
- **TODO**: License from Jest, Jasmine, Underscore
- **Priority**: Low
- **Effort**: Low
- **Recommendation**: Icons are nice. License attribution is good practice but can be in speaker notes.

#### Talk Overview - License Reference (Line 165)
- **TODO**: Reference on license verbatim from Jasmine, Jest
- **Priority**: Low
- **Effort**: Low
- **Recommendation**: Include in speaker notes or appendix if needed.

---

### 5. Deep Dive Content (Optional)

#### Expect API Section (Lines 294-295)
- **TODO**: Sample chai extension system (next slide?)
- **TODO**: Object formatting and error diff. @vitest/pretty-format (next slide?)
- **Priority**: Low
- **Effort**: Medium
- **Recommendation**: Could be deep for main talk. Consider for Q&A or advanced section.

#### Snapshot Testing (Line 324)
- **TODO**: Sample snapshot inline / file
- **Priority**: Low
- **Effort**: Low
- **Recommendation**: Could add quick example if time permits.

#### Test Collection Section (Lines 330-331, 336)
- **TODO**: Improve layout. Improve clicks
- **TODO**: Do we need? Move after "Test runner" slides?
- **TODO**: [Long comment about server/reporter entities]
- **Priority**: Medium
- **Effort**: Low-Medium
- **Recommendation**: Consider flow. Might work better after Test Runner introduction.

---

### 6. Runner & Architecture Details (Optional)

#### Test Runner Section (Line 396)
- **TODO**: Explain browser mode before server module runner?
- **Priority**: Low
- **Effort**: Low
- **Recommendation**: Order depends on audience familiarity. Node.js first is conventional.

#### Module Runner Section (Lines 432, 441)
- **TODO**: Based on `vite/module-runner` (commented out slide)
- **TODO**: Elaborate more?
- **Priority**: Low
- **Effort**: Medium
- **Recommendation**: Commented out. Consider if needed based on time.

#### Browser Mode Section (Line 470)
- **TODO**: Vite SPA analogy? Or seems like we can skip it
- **Priority**: Low
- **Effort**: Low
- **Recommendation**: Skip unless audience needs clarification.

---

### 7. Advanced Topics (Low Priority)

#### Module Mocking Section (Lines 483, 491)
- **TODO**: Explain runtime mechanism? Split slides?
- **TODO**: Visualize { add: vi.fn() }
- **Priority**: Low
- **Effort**: Medium
- **Recommendation**: Good for deep dive but might be too technical for overview.

#### Test Scheduling Section (Lines 553, 555)
- **TODO**: Test scheduling for browser mode? (skip since it's complicated)
- **TODO**: [Content placeholder]
- **Priority**: Low
- **Effort**: High
- **Recommendation**: Author suggests skipping. Focus on main concepts.

---

### 8. Incomplete Sections (Needs Content)

The following sections have placeholder TODOs and need content:

#### Client-Server Communication (Lines 563-564)
- **TODO**: birpc (runtime agnostic)
- **Priority**: Medium
- **Effort**: Medium
- **Content**: Explain IPC, MessageChannel, WebSocket, BroadcastChannel

#### Reporter API (Line 573)
- **TODO**: [Section needs content]
- **Priority**: Medium
- **Effort**: Medium

#### Coverage (Line 579)
- **TODO**: [Section needs content]
- **Priority**: Medium
- **Effort**: Medium

#### Watch Mode (Line 585)
- **TODO**: [Section needs content]
- **Priority**: High
- **Effort**: Medium
- **Content**: Explain file watcher, module graph, HMR integration

#### Summary (Line 591)
- **TODO**: Back to initial lifecycles story to summarize?
- **Priority**: High
- **Effort**: Low
- **Recommendation**: Strong close. Tie back to lifecycle overview.

#### Thank You (Line 597)
- **TODO**: [Section needs content]
- **Priority**: Low
- **Effort**: Low
- **Recommendation**: Add sponsors, contributors acknowledgment

---

### 9. Questionable Sections (Consider Removing)

#### "Why Testing?" (Line 183)
- **TODO**: Probably can skip assuming it's obvious
- **Recommendation**: **Skip** - Author is right, not needed for this audience

---

## Execution Plan

### Phase 1: Critical Structure (Do First) - 4-6 hours
1. **Decide on Talk Structure** (High Priority)
   - Lines 141-157: Decide package→features vs features→packages order
   - Lines 258-259: Remove or merge "Test framework features" section
   - Update table of contents and flow

2. **Complete Core Content Sections** (High Priority)
   - Line 563: Client-Server Communication content
   - Line 579: Coverage content
   - Line 585: Watch Mode content (essential Vitest feature)
   - Line 555: Test scheduling content

3. **Create Architecture Diagram** (High Priority)
   - Line 383: Client-server architecture diagram
   - Shows: ViteDevServer, pools, browsers, workers, module flow

4. **Lifecycle Visual Enhancement** (High Priority)
   - Lines 232-235: Add progressive highlights/clicks
   - Map to reporter output incrementally

### Phase 2: Visual Polish (Do Second) - 3-4 hours
5. **Add Visual Elements**
   - Lines 16-17: GitHub avatar, VoidZero logo
   - Lines 78-79: Code layout, icons
   - Lines 270, 276: Jest, Chai icons
   - Line 242: Highlight execution portions in code

6. **Improve Section Layout**
   - Lines 193-194: CLI, config, test, output layout
   - Lines 330-331: Test collection layout and clicks

### Phase 3: Supporting Content (Do Third) - 2-3 hours
7. **Complete Remaining Sections**
   - Line 573: Reporter API content
   - Line 591: Summary (tie back to lifecycle)
   - Line 597: Thank you slide content

8. **Add Code Examples**
   - Line 324: Snapshot inline/file example
   - Line 451: Before/after module runner snippets (if needed)

### Phase 4: Optional Enhancements (If Time Permits) - 3-4 hours
9. **Deep Dive Content**
   - Lines 294-295: Chai extension, pretty-format
   - Lines 483, 491: Mocking runtime, visualization

10. **Progressive Code Examples**
    - Lines 102, 114: Code morphing to Vue examples

11. **Additional Context**
    - Line 165, 276: License attributions (speaker notes)

### Phase 5: Review & Polish (Final) - 1-2 hours
12. **Final Review**
    - Remove questionable TODOs (line 183)
    - Clean up all TODO comments
    - Test slide flow and timing
    - Ensure all clicks/animations work

---

## Recommendations Summary

### Must Do (Can't present without these):
1. Decide and implement talk structure order
2. Complete Watch Mode section (key Vitest feature)
3. Add architecture diagram
4. Lifecycle visual enhancements
5. Complete Client-Server Communication
6. Add Summary slide content

### Should Do (Significantly improves presentation):
7. Complete Coverage and Reporter API sections
8. Add visual elements (avatars, icons, logos)
9. Improve code highlighting
10. Complete Thank You slide

### Nice to Have (Polish):
11. Additional code examples and morphing
12. Deep dive content on mocking and formatting
13. License attributions

### Skip:
14. "Why Testing?" section
15. Browser mode test scheduling details
16. Overly complex runtime mechanism explanations

---

## Time Estimates

- **Minimum Viable Presentation**: Phase 1 (4-6 hours)
- **Good Quality Presentation**: Phases 1-3 (9-13 hours)
- **Polished Presentation**: Phases 1-4 (12-17 hours)
- **Perfect Presentation**: All Phases (13-19 hours)

---

## Next Steps

1. Review this document and decide priority based on presentation deadline
2. Start with Phase 1 items
3. Work through phases sequentially
4. Test presentation flow after each phase
5. Get feedback from colleagues if possible
6. Practice timing with completed slides
