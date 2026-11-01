Signed money value. Fredoka and Figtree place + and − low (on the maths axis), so a raw "−€12" looks off-centre next to the digits. `signed()` lifts the sign by 0.07em.

```jsx
<Amount value="−€11.20" />
{signed(fmt(balance))}
```

Badge (numeric), ListRow amount and HeroCard amount already apply it. Use U+2212 (−) for negatives, not a hyphen.
