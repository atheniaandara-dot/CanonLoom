# User guide

## Start the app

Use the standalone HTML release asset in a modern browser, or a hosted copy if your maintainer has published one. The same app is also built by `npm start`. Use a normal browser rather than a file-preview app. Mobile file viewers may not run scripts; hosted use is more practical on a phone.

Choose English or Indonesia in the sidebar. Most interface labels and the built-in guide are translated. Detailed checker diagnostics and exported context are currently English.

The first visit opens an example. Nothing has been imported from your account or previous conversations. The original story, **The Glass Harbor**, demonstrates three mistakes. Select **Check report**, review each expected value and source, and use **Edit event** to fix the scene. **Match recorded canon** changes the claim to the earlier value. It does not edit the prose for you.

## Create a story

Choose **New story**, enter a title and optional description, then save. This replaces the active workspace. Download a backup first if you want to keep the previous story. You can work on several stories by exporting and importing separate JSON files, but only one is open at a time.

## Establish a story bible

Add named entities under **Story bible**. Types are character, location, item, and world. Entity notes are freeform reference material. Use opening facts for information the checker should understand.

For example, create Mira as a character and Lower Quay as a location. Choose **Add opening fact**, select Mira, choose Location, then select Lower Quay by name. Internal identifiers are generated automatically. You do not need to write code or remember IDs.

Common facts:

- **Clothing:** `blue waxed coat`.
- **Injury:** detail key `left-wrist`, value `bandaged`.
- **Knowledge:** detail key `sealed-route`, value False until Mira learns it.
- **Relationship:** select the other character, then enter `uneasy allies`.
- **Form of address:** select the other character, then enter `Captain`.
- **Holder:** select an item as the subject, then its character or location holder.
- **Emotion:** `wary` or a more precise description.
- **Custom:** a machine-friendly field such as `rank`, with a text, numeric, boolean, or null value.

Use consistent spelling: `blue coat` and `blue waxed coat` are different values. A Source can be a chapter, paragraph reference, or short explanation. Lock a fact if a scene must never change it. Editing a locked opening fact is a deliberate retcon and recalculates the whole story.

World rules require a particular value or forbid a particular value for one entity and field. A rule is always active, including at the opening. Store wider natural-language world-building in notes; the engine does not interpret those notes as executable rules.

## Add and review scenes

Choose **Scenes → Add scene**. Story order is chronological, independent of reading order. Use optional elapsed story minutes to detect time going backwards. For flashbacks, assign the earlier chronological order. There is only one timeline in this release.

Scene text or summary is stored for reference. It is not automatically analyzed. Add events for the facts you want checked:

| Event           | Meaning                                                               |
| --------------- | --------------------------------------------------------------------- |
| Check a fact    | The scene says this is already true. Compare it with preceding canon. |
| Record a change | An explicit story action changes this value. Include the reason.      |
| Remove a fact   | Stop recording this fact. This means unknown, not false.              |

Events run top to bottom. Move an event up or down when story order matters. A journey must occur before a claim that a character is at the destination. A revelation must occur before a claim that they know the secret.

Draft scenes do not affect other scenes. Choose **Make canon** after errors are resolved. Warnings still deserve review, but they do not prevent the commit. If editing an earlier scene creates a contradiction in a later canon scene, the later scene becomes Blocked and none of its changes apply until repaired. This is intentional; the engine will not silently overwrite your canon.

The Story bible shows opening facts by default. Switch on **Current canon** to inspect the state after successful canon scenes. Use **AI context → Through scene** to export the state at an earlier point.

## Find recorded details (unreleased)

These search improvements are available when running the current source on `main`; the published v0.1.0 HTML has the earlier name-and-notes search.

In **Story bible**, search a name, note, attribute, value, or source. For example, `blue waxed coat` finds the character wearing it, and `warehouse accident` finds facts citing that source. Referenced names work too: search `Soren Ash` to find his facts, relationships addressed to him, and items he holds. Use the type filter to narrow the results. Cards and the facts table use the same filters; the table includes matches beyond the five-fact card preview. A matching entity name or note shows all that entity's facts.

Search uses **Opening canon** by default. Enable **Current canon** to search facts after successful canon scenes; changes in drafts or blocked scenes are not part of that state. World rules remain visible independently of the search.

In **Scenes**, search titles, summaries, event subjects, attributes, values, sources, or reasons for changes. For example, `despite her fear` finds the crossing scene. Matching scenes retain every event in chronological story order, including drafts and blocked scenes. Opening a scene from the overview clears any scene search that would hide it.

Search is literal, case-insensitive text matching with Unicode normalization. It does not interpret prose, use regular expressions, change saved data, or limit the continuity checker. **Clear search** restores the list while keeping the selected entity type. Search and type filters reset when you replace the workspace. English and Indonesian search controls are available.

## Backup and recovery

Use **Export backup** regularly. The file includes all entities, opening facts, rules, scenes, statuses, summaries, and events. Keep it somewhere you control. Import accepts a file or pasted JSON and validates it before changing the workspace.

Saving keeps the previous successful browser save when storage is available. **Getting started → Previous save** offers a one-step recovery. This is not a full version history. Any subsequent save can replace that recovery point.

When browser storage fails or fills up, the app keeps the working copy in memory, shows an unsaved warning, and asks you to export. Do that before closing the tab. Corrupt saved bytes are not automatically erased. If another tab changes the story, export your current work and reload; the app refuses to overwrite the newer saved version silently.

## Use with an AI assistant

Open **AI context**, select director scope or one character, and copy or download the Markdown. Paste it into your writing assistant along with your actual scene instructions.

Director scope includes all committed facts, reference notes, provenance, and world rules. Character scope includes only that character's facts, omitting other entities, notes, and sources. Names used by that character's relationship and location fields can still appear. Treat this as a writing aid and review it for spoilers; it is not a secure permission system.

CanonLoom does not connect to, charge for, or control an AI model. Add changes from the completed scene back into CanonLoom yourself.
