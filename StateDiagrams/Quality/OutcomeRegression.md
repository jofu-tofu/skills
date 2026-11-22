# StateDiagrams outcome regression

Give the Request section to a reviewer using the skill. Keep the grading section separate until the result is available.

## Request

Model a parcel in Ready. On scan, evaluate these rules in order. First, a recalled parcel goes to Held and alerts dispatch. Second, an express parcel goes to Loading and books a bay. Otherwise the parcel stays Ready and records a scan. The flags are independent. Convert the model to a diagram and a transition table. Then review a copy of the diagram with the first two tests reversed.

## Grade separately

Replay (recalled, express) as (true,true), (true,false), (false,true), (false,false). The first two produce Held/alert only, the third Loading/book only, the fourth Ready/record only. Sequential choices or explicit non-overlapping guards are valid. Reject the reversed diagram for the overlap witness. If a second source gives the same guards without priority, surface that ambiguity and preserve the three unambiguous results.
