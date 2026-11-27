# Cinema Profile — Adaptive Edition design and validation

The assessment is a cinema-based exploratory instrument inspired by cognitive
functions, MBTI, Objective Personality and Enneagram. It is **not** an official
psychometric instrument, and its output indices are not calibrated typing
probabilities. The existing Classic Edition uses its original bank and score
model; its saved results are separate from the new edition.

## Main assessment

| Part | Two-option items | Five-point satisfaction items | Total |
| --- | ---: | ---: | ---: |
| Core (four blocks) | 28 | 4 | 32 |
| Depth (three blocks) | 21 | 3 | 24 |
| Combined | 49 | 7 | 56 |

Each eight-question block has one probe for each of the five Coins, two
independent taste or story-motive choices, and a satisfaction break. Across all
seven blocks there are 35 cognitive probes, five direct taste choices, nine
independent motive choices and seven ratings (four ending-specific and three
whole-film). The five Coin positions rotate by block. Within each Coin, the
order of the answer poles is seed-counterbalanced: exactly two of each in the
core, and 1/2 or 2/1 in depth.

The scene-first revision contains 70 cinematic forms across the 35 cognitive
slots, of which 24 compare two moments within the same film (10 primary and
14 alternate). Each slot also has a short fictional situation. A cinematic
form asks about an actual detail, decision, relationship, consequence, or
interpretation from the story. Both the prompt and its options are written for
that specific film context, and the artwork illustrates the narrative rather
than simply representing a title. Parallel forms retain the same underlying
hypothesis, direction and scoring slot, not necessarily the same wording.
They have not been statistically equated. Within-film comparisons remove
some between-title preference effects by design; repeated different contexts
are still important. Films are interpretive cues, not definitions or diagnoses
of their characters, and the tasks are neither trivia nor direct personality
self-report. A film choice is directional evidence only when the visitor
continues with familiar scenes under the introductory instruction (an inferred
viewing declaration, not independent verification);
unfamiliar forms can be replaced, and a written response does not establish
viewing history. Known-unseen films are bypassed when possible. A rating uses
a second film or remains skipped if neither film is familiar. Neutral answers
and skips do not support either pole. No fallback adds a question to the count.

The scene-first revision has an independent saved-state key so earlier Adaptive
preview choices are preserved without reinterpreting them against new prompts.
Classic Edition results and question mappings remain unchanged.

## Evidence

- Cognitive, cinematic taste and story motives do not borrow points from one
  another. Frame/atmosphere/rhythm choices contribute to form and tone only;
  an intended viewing choice is weaker than actual whole-film satisfaction.
  An ending rating informs ending preferences only. Film exposure is recorded
  only when reported directly or through guided continuation.
- The five contrasts have source-separated counts, positive/negative
  evidence, contextual coverage, neutral, skipped and unverified responses.
  The existing shrinkage model is retained and treated as a heuristic:
  at least three independent slots, two contexts and a 70% directional
  share are needed for a resolved direction. Strong film/text disagreement
  leaves the contrast open. Written-only or mixed evidence without repeated
  familiar-film support is provisional.
- Nine story motives are each presented twice, in different comparisons. The
  preliminary stage does not force a leading motive or a wing; a full profile
  can still be tied or unresolved.
- When the main depth stage ends, optional written probes target only
  unresolved Coins. There are two per Coin in a separate bank (up to six
  per pass, no repeat); they retain the same evidence-source distinction.
- The optional twelve-question Counterframe remains separate. It has its own
  parallel forms, neutral answers, and five-point intensity; its responses
  cannot update the five Coin scores, taste or motive scores.
- The exported prompt decodes terminology and reports evidence counts,
  conflicting directions, examples, declared watched films and direct
  cinematic preferences. The public portrait retains Archive nomenclature.

## Validation still needed

The software can verify scheduling, mappings, source isolation, parallel-form
availability and deterministic scoring with synthetic cases. Those checks
do **not** establish construct validity, reliability or equivalence between
film and written forms.

A prospective, consent-based evaluation should include:

1. Cognitive interviews in both languages. Ask participants to paraphrase
   questions and explain the basis of their response without describing the
   intended pole. Check whether film affinity, star preference, caption
   wording, visual appeal, translation or knowledge of the film drives the
   answer instead of the construct. Revise ambiguous or leading items.
2. Pilot all forms with participants who know different subsets of the
   catalogue. Randomly assign eligible parallel forms; compare missingness,
   completion, response distribution, neutral rate and construct direction.
   Do not assume parallel forms are equivalent just because their labels
   match. Check differential item functioning by language and familiarity.
3. Examine internal structure across each contrast, stability on a later
   retest, agreement with independently collected external measures where
   available, and the uncertainty of the final inferred family. Avoid selecting
   thresholds simply to recreate a desired MBTI/OPS result. If the data and
   sample justify it, fit a graded or forced-choice model and use a held-out
   sample before changing the heuristic or presenting confidence intervals.
4. Observe interaction burden (form replacements, skips, abandonment,
   time per item and usefulness of optional depth), then revise without
   exposing the inference machinery to participants.

An optional result-page question-feedback panel supports the first pilot
step without interrupting the test. It samples up to three answered probes.
The reason is kept in the visitor's browser, excluded from scores, and can
be copied voluntarily as a short coded record containing no viewing list or
name. There is no automatic collection or analytics. Actual validation
requires independent participants and consent.

Method references:

- [Standards for Educational and Psychological Testing (open access)](https://www.testingstandards.net/open-access-files.html)
- [CDC/NCHS: Cognitive interviewing for question evaluation](https://www.cdc.gov/nchs/ccqder/question-evaluation/cognitive-interviewing.html)
- [Objective Personality FAQ](https://www.objectivepersonality.com/faq)
