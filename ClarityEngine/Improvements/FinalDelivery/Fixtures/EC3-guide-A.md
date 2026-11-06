# Review shipments missing a manifest

Shipment Review warns when a coordinator selects Release for a pending shipment with no manifest. The warning gives the coordinator a chance to check the shipment before it enters the release queue. It does not determine whether the shipment requires a manifest; the coordinator still follows the applicable shipping policy.

To try this workflow, choose an environment where this warning is enabled and open an editable pending shipment without a manifest in Shipment Review. The coordinator must have access to Release. A developer console is not required. The rollout note calls this change CHANGE-472, but the note does not identify a feature flag, an environment name, or a customer deployment.

Select Release. The warning appears, and the shipment remains pending until the coordinator chooses what to do. Choose Continue to submit the shipment to the release queue without a manifest. Choose Cancel instead to leave it pending without submitting it. The Cancel path lets the coordinator add the missing document or leave the shipment for later review.

Confirm both choices using pending shipments with the same prerequisites. After Continue, check that the shipment entered the release queue. After Cancel, check that it remains pending and was not submitted. Do not infer from the warning whether a manifest is required: that decision comes from the applicable policy, not this feature. These instructions describe expected behavior; no customer test or production result has been supplied.
