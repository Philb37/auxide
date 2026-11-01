White row with leading tile, title, meta and amount; the workhorse for entries, categories and pockets.

```jsx
<ListRow leading={<CategoryTile hue={145} label="G" size="md"/>} title="Monoprix" meta="Groceries" amount="€46" />
```

Pass children (e.g. a ProgressBar row) to get the category-row layout, where the amount moves up next to the title.
