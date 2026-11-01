Panel container: bottom sheet on phone, right drawer on tablet, centred modal on desktop.

```jsx
<Sheet variant="sheet" onClose={close}>…</Sheet>
```

Must sit inside a position:relative screen. sheet shows a grabber. Slides with cubic-bezier(.2,.8,.2,1) .3s.
