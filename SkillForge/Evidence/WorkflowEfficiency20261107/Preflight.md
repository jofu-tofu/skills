# First-pair observation

Ledger completed in both arms; external VM and actual Node CLI checks pass and
both repaired tools use one input read. Both completion gates finish complete.
Baseline: 249.923 seconds, 12 commands, 655168 input/609920 cached/7647 output
tokens, 170662 returned bytes. Candidate: 258.726 seconds, 15 commands,
793786 input/747136 cached/7102 output tokens, 187943 returned bytes.

Treatment was delivered in candidate UpdateSkill. Baseline commands item_3 and
item_5 both read EstablishQuality and DesignMeasurement. Candidate reads those
once, but loads more templates and splits reading into more commands. Literal
ApproveSkill mentions in finalization code are not extra reads. Baseline's large
batch may explain recovery; trace output itself carries no truncation marker,
which does not prove the model received every byte. These are observed actions,
not proof that the paragraph caused their difference.

Candidate initially invoked CheckCompletion with root-prefixed filenames and an
explicit root, received an ENOENT/continue, corrected it and reached complete.
Both authors ran the legacy validator against the disposable target and retained
its pre-existing conventions as limitations. Candidate command exit counts are
not two target failures. Its extra target Improvements/Index.md is allowed scope.

Decision: no Ledger efficiency win. Continue the predeclared Prompting family:
different exposure/actions exist and historical real-target rereads supply a
relevant next contrast. Do not add repeated Ledger samples to search for a win.
No treatment edit before this second pair. The candidate's missing benefit is
not permission to drop checks, hide errors or tune reference expectations.

## Correction after full command inspection

The preceding claim that the candidate read those procedures once was wrong:
item_3's long command also names DiagnoseGap, EstablishQuality and
DesignMeasurement; item_4 rereads them. The initial abbreviated command display
hid the tail. Both arms therefore repeat these reads. Candidate exposure is
established, but the intended reuse mechanism is not. No causal reuse comparison
is supported. Prompting candidate had already started when this was discovered;
preserve it as exploratory, inspect its actual complete commands, and amend the
next comparison before expanding. Cost and external quality observations above
remain valid. This correction changes mechanism interpretation, not scores.
