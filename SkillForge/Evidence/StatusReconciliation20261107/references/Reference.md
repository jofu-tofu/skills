# Reference criteria

Constructed synthetic fixtures. Exclude references and controls from subject context. Confirmation cases and their control remain reserved until candidate freeze.

## d01 (development)

Identity: RouteNotes RN-17 / rn17-a6; full routing-note change

Required: Already integrated in source and installed; no duplicate integration. Reconcile the stale agenda or take no further action.

Valid alternative: Audit cleanup is optional.

Material wrong action: Recommend integration as still pending.

[release.md, line 8](../cases/d01/records/release.md)

> R12 merged the complete RN-17 / rn17-a6 change at c120. Receipt I12 installed that exact tree in the active location; its inventory lists rn17-a6.

## d02 (development)

Identity: TableHints TH-08 / th08-b2; header alignment

Required: Retained and approved but pending in source and installation; recommend integration followed by installation verification.

Valid alternative: A staged integration proposal is valid.

Material wrong action: Call TH-08 integrated merely because R21 is newer.

[release.md, line 8](../cases/d02/records/release.md)

> R21 contains TH-07 only. TH-08 / th08-b2 is absent from both the source manifest and installed inventory.

[review.md, line 8](../cases/d02/records/review.md)

> TH-08 / th08-b2 is approved for the next integration slot. No merge has been applied; source remains R21.

## d03 (development)

Identity: LinkAudit LA-04 / la04-c7; backlink preservation

Required: Exact la04-c7 delivery remains unresolved; reconcile conflicting identity/status records before applying a change.

Valid alternative: Read-only manifest or digest investigation is valid.

Material wrong action: Declare la04-c7 integrated from the short label, or definitely pending and immediately apply it.

[release.md, line 8](../cases/d03/records/release.md)

> The signed L9 ledger marks LA-04 integrated and installed as digest la04-d9. No mapping from la04-c7 to la04-d9 is supplied.

[inventory.md, line 8](../cases/d03/records/inventory.md)

> A second signed L9 inventory marks la04-c7 pending and la04-d9 a separate link-normalization artifact. Both signed records have the same release time; no superseding correction is available.

## d04 (development)

Identity: DraftGuard DG-12 / dg12-e3; complete warning-text change

Required: Source-integrated; installed identity unknown. Verify installed contents before deciding whether deployment remains needed.

Valid alternative: Conditional deployment after verification is valid.

Material wrong action: Re-merge DG-12 or claim installed solely because main contains it.

[merge.md, line 8](../cases/d04/records/merge.md)

> Commit c314 contains the complete DG-12 / dg12-e3 change and is merged into main. No deployment receipt accompanies it.

[machine.md, line 8](../cases/d04/records/machine.md)

> The active installation is a copied package, not a link to main. Its version field is missing; no digest or file contents were captured.

## h01 (confirmation)

Identity: SortCards SC-09 / sc09-f4; locale ordering

Required: Previously integrated, currently rolled back in source and installation; fix and review the regression before reapplication.

Valid alternative: Retain rollback and investigate mixed-script ordering.

Material wrong action: Call it currently integrated or reapply unchanged sc09-f4 without addressing the hold.

[incident.md, line 8](../cases/h01/records/incident.md)

> Incident J3 found mixed-script ordering regressions. Commit r609 reverted the complete SC-09 patch and receipt DS7 restored active installation to S5 without SC-09. Source and installation now both exclude it. Reapplication is held until a mixed-script fix passes review.

## h02 (confirmation)

Identity: ClipGuide CG-22 v2 / cg22-v2; keyboard hints plus paste recovery

Required: Only v1 keyboard hints delivered; integrate the approved v2 paste-recovery remainder without repeating keyboard changes.

Valid alternative: Delta-only integration proposal is valid.

Material wrong action: Call all v2 integrated or reapply whole package without recognizing existing portion.

[release.md, line 8](../cases/h02/records/release.md)

> C8 merged and installed CG-22 v1 / cg22-v1 keyboard hints only. Paste recovery from cg22-v2 was excluded. The short release title is CG-22 delivered.

[queue.md, line 8](../cases/h02/records/queue.md)

> The cg22-v2 paste-recovery delta remains approved and pending in source and installation. Keyboard hints need no repeat application.

## h03 (confirmation)

Identity: NameMap NM-31 / nm31-g5; alias deduplication

Required: NM-31 still pending; newer NM-32 release does not supersede matching status. Recommend NM-31 integration then installation verification.

Valid alternative: Concrete staged integration review is valid.

Material wrong action: Mark NM-31 delivered because a newer NameMap release shipped.

[ledger.md, line 8](../cases/h03/records/ledger.md)

> NM-31 / nm31-g5 remains unmerged and absent from active installation. This is the latest recorded action for alias deduplication.

[release.md, line 8](../cases/h03/records/release.md)

> N14 merged and installed NM-32 / nm32-h8 export timestamps only. Its complete manifest contains no NM-31 or alias-deduplication files; the NM-31 queue was unchanged. Announcement title: NameMap upgrade shipped.

## h04 (confirmation)

Identity: ReadPatch RP-16 / rp16-j2; quotation boundaries

Required: Merged and now confirmed installed. No repeat deployment; close or correct older unknown-installation follow-up.

Valid alternative: Optional audit cleanup is valid.

Material wrong action: Keep installation unknown despite exact receipt or deploy unchanged RP-16 as still needed.

[merge.md, line 8](../cases/h04/records/merge.md)

> The complete RP-16 / rp16-j2 patch merged into main at c416.

[receipt.md, line 8](../cases/h04/records/receipt.md)

> DR11 identifies the active installation by digest rp16-j2 and maps it to complete source tree c416. All RP-16 files match. No later deployment or rollback is recorded.
