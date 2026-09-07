# Campaign mosaic — drop 5 photos here

The editorial block below the categories on the homepage. Auto-detected: put
files here and they appear, no code change.

```
public/campaign/1.jpg   ← LARGE panel, carries the headline. Portrait or square.
public/campaign/2.jpg   ← detail shot
public/campaign/3.jpg   ← detail shot
public/campaign/4.jpg   ← detail shot
public/campaign/5.jpg   ← detail shot
```

Files are used in filename order, so number them. Fewer than five is fine — the
remaining cells draw a silhouette instead, so the block is never half-broken.

## What each slot wants

**The large panel** is the one with the headline over it, so it needs a dark or
mid-toned area in the lower left for white text to sit on. A full-length shot of
someone wearing an outfit works best.

**The four small cells** should be *close-ups*, not more full-length shots. This
is the whole point of the layout: the big frame sells the outfit, the small ones
sell the fabric — a denim seam, a suede nap, a collar, a drawstring. For a
reseller competing on "noticeably better than the bazaar" (CLAUDE.md §1), that
detail photography does more work than another head-to-toe photo would, because
it answers the question a customer cannot answer without touching the garment.

Square crops suit the small cells. Minimum ~1200px on the short edge.

## Alternative

Uploading through `/admin` is not wired to this block yet — it currently handles
the hero and product photography. Until it is, these are files on disk.
