Stroke icon drawn on a 24px grid, so it centres exactly inside any flex box (text glyphs don't — their side bearings and baseline push them off-centre).

```jsx
<Icon name="back" size={20} />
```

name: back | next | plus | close | check | more | down | arrow | backspace. Legacy glyphs (‹ › + ✕ ✓ ••• ▾ → ⌫) map to the same icons. Inherits colour via currentColor. Default stroke 2.4; use 2.6–3 below 16px.
