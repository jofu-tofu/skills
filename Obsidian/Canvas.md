# Obsidian Canvas

Canvas is Obsidian's infinite whiteboard for visual thinking.

---

## What Canvas Is
- Infinite spatial canvas for arranging notes, images, and ideas
- Non-linear thinking space alongside linear notes
- Visual project planning and relationship mapping
- Uses open `.canvas` format (JSON)

## Node Types
| Type | Description | Syntax |
|------|-------------|--------|
| Text | Standalone text card | Click canvas, type |
| Note | Embedded vault note | Drag note to canvas |
| File | Image, PDF, audio, video | Drag file to canvas |
| Link | Web page embed | Paste URL |
| Group | Container for nodes | Draw rectangle around nodes |

## When to Use Canvas
- **Mind mapping**: Visual brainstorming
- **Project overview**: See all pieces at once
- **Relationship mapping**: Connect disparate concepts
- **Mood boards**: Visual collections
- **Presentation planning**: Spatial storyboarding

## JSON Canvas Format
```json
{
  "nodes": [
    {"id": "1", "type": "text", "x": 0, "y": 0, "width": 250, "height": 100, "text": "Content"}
  ],
  "edges": [
    {"id": "e1", "fromNode": "1", "toNode": "2"}
  ]
}
```
