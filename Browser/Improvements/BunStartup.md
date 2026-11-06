# Bun startup and entrypoint completion

Candidate16 returned exit0 without starting a session under Bun1.3.5. Awaiting the CLI entrypoint exposed the Windows server-launch failure. Candidate18 probes existing Node native TypeScript support and uses it for the persistent session; the cached-tsx fallback is offline/no-install. Candidate19 also awaits the standalone verification example. Actual Bun lifecycle5/5 and selector/example7/7 pass; Node lifecycle5/5 is preserved. No dependencies installed.

Evidence: RemainingSkills20261104/deep/engineering/bun-run-cold-start-candidate16, bun-run-cold-start-candidate18, bun-selector-candidate19, cold-start-candidate18. Other OS/browser engines, older loader fallback, optional codegen/open helper workflows remain unverified. This is process/runtime compatibility, not authentication or race-proof ownership.
