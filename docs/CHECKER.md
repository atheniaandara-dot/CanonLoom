# Checker semantics

`checkProject` is a pure deterministic replay. It validates the input first, never mutates it, and returns diagnostics, scene outcomes, and committed facts with provenance.

## Replay contract

1. Opening facts establish one value per `(entity, field)` pair. Duplicate pairs are invalid input.
2. World rules validate the opening. Any opening rule violation blocks all scene commits until fixed.
3. Scenes sort by unique nonnegative `order`; array order is not chronological authority.
4. Each scene starts with a temporary copy of earlier committed canon. Its events run in array order.
5. `assert` compares exact primitive values. It never establishes or changes canon.
6. `set` updates the temporary state unless blocked by a lock or rule. A change from an existing value without a nonblank reason produces a warning.
7. `unset` removes a fact unless blocked. Unrecorded, `null`, `false`, `0`, and `""` are distinct.
8. A scene commits only if its status is `canon` and it has no errors. A draft or blocked scene discards **all** temporary changes, including otherwise valid ones.
9. Subsequent scenes continue from the last successfully committed state. There is no implicit stop at the first failed scene, so downstream issues may be consequences of that failure.

Locks come from opening facts and cannot be removed by scene events. Setting an unchanged locked value is harmless. World rules apply to opening state and each attempted state change, including temporary intermediate changes. An `equals` rule requires a known matching value; a `notEquals` rule allows unknown but rejects its forbidden value.

## Diagnostics

| Code                      | Severity | Meaning                                                                |
| ------------------------- | -------- | ---------------------------------------------------------------------- |
| `CONTRADICTION`           | error    | A scene claim disagrees with established canon.                        |
| `KNOWLEDGE_LEAK`          | error    | A character claims knowledge explicitly recorded as false.             |
| `LOCKED_FACT`             | error    | An event would change or remove a locked opening fact.                 |
| `WORLD_RULE`              | error    | Opening canon or an event violates a world constraint.                 |
| `INVALID_OPENING`         | error    | Opening rule violations prevent scene commits.                         |
| `TIMELINE_REVERSED`       | error    | A scene's elapsed minute is earlier than the last committed timestamp. |
| `UNKNOWN_FACT`            | warning  | No earlier fact establishes a claim.                                   |
| `UNESTABLISHED_KNOWLEDGE` | warning  | A knowledge claim is true but no earlier knowledge record exists.      |
| `UNEXPLAINED_CHANGE`      | warning  | An existing fact changes without a nonblank reason.                    |
| `UNKNOWN_REMOVAL`         | warning  | An event removes an already unrecorded fact.                           |

Diagnostics carry scene/event IDs where applicable, entity and field, expected/actual values, and the prior source. Undefined expected/actual values are omitted by JSON serialization. `changes` on a scene result describes attempted valid state changes; always inspect `committed` before treating them as canon.

## Time, relationships, and knowledge

Elapsed minutes are optional integers measured from an author-defined origin. Equal timestamps are allowed. A scene without a timestamp does not reset the last known time. Draft and blocked timestamps do not advance the committed clock. This is a sequence checker, not a travel-duration or simultaneous-scene solver.

Relationships and forms of address are directional. Mira calling Soren Captain does not imply how Soren addresses Mira. There is no automatic reciprocal relationship or automatic knowledge sharing. Location and holder values are entity references with type validation. One item has one holder value; separate copies should be separate item entities.

Injury and emotion fields are exact records, not medical or psychological models. The engine neither estimates healing time nor judges whether an emotional transition is believable. It exposes the change and its explanation for the writer to review.

## Scope and retcons

`throughScene` includes that scene's evaluation and stops before later ones. If it is a draft, its temporary state is discarded. Future errors do not appear in the earlier report. An unknown scene ID is an error.

Changing an opening fact or earlier scene replays the entire requested timeline. Back up before large retcons. No history, branch, or manual warning-dismissal database is hidden outside the project JSON.
