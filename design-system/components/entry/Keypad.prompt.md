Numeric keypad pinned to the bottom of the entry panel on touch devices.

```jsx
<Keypad onKey={k=>setAmt(a=>keypadInput(a,k))} onDone={hide} />
```

Exports keypadInput(s,k): one decimal, two decimals max, 8 chars max, leading 0 replaced.
