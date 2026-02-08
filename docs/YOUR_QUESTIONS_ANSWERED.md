# Your Questions Answered

## Question 1: "Tables are singular - should we change them?"

### Answer: ❌ NO! Keep them as they are.

**Why?**
- ✅ Singular is CORRECT for JHipster projects
- ✅ Matches the entity-to-table pattern (one entity = one table)
- ✅ Current tables follow the right standard

**Example:**
```sql
✅ CORRECT (Current):
restaurant  -- One entity Restaurant = one table restaurant
menu_item   -- One entity MenuItem = one table menu_item

❌ WRONG:
restaurants -- Would break JHipster convention
menu_items  -- Would require changing all entity @Table annotations
```

**My mistake:** My original document said "plural" - that was WRONG. You correctly spotted this!

**Action:** ✅ **DO NOTHING** - tables are already correct!

---

## Question 2: "State in URL - is it because token is stored in state?"

### Answer: ❌ NO! Token is NOT in URL.

**Current Implementation (CORRECT):**
```typescript
// Token stored in localStorage
localStorage.setItem('kc_token', token);  ✅

// Token sent in Authorization header
headers: { Authorization: `Bearer ${token}` }  ✅

// Token NOT in URL ✅
```

**This is the RIGHT way!**

**Why NOT in URL:**
- ❌ URLs are logged (insecure)
- ❌ URLs can be shared (token leak)
- ❌ URLs are in browser history
- ✅ localStorage + header = industry standard

**Need from you:** Please share what the URL looks like so I can see what "state" you're referring to.

**Possible causes:**
1. OAuth2 redirect params (temporary during login - normal)
2. Next.js internal state (harmless)
3. Something else (need to see URL)

---

## Question 3: "What are the proper conventions?"

### Answer: ✅ Final standard established.

```
┌──────────────────────────────────────────────────┐
│         OFFICIAL CONVENTIONS (FINAL)             │
├──────────────────────────────────────────────────┤
│ Database Table:  restaurant      (SINGULAR)     │
│ REST API:        /api/restaurants (PLURAL)      │
│ Frontend:        /restaurants     (PLURAL)      │
│ Menu:            /restaurants     (PLURAL)      │
│ Java Class:      Restaurant       (SINGULAR)    │
│ TypeScript:      Restaurant       (SINGULAR)    │
└──────────────────────────────────────────────────┘

Rule: Database = SINGULAR, User-facing = PLURAL
```

**Why different?**
- Database = Stores ONE record → singular
- API = Serves COLLECTION → plural
- Frontend = Shows COLLECTION → plural (match API)
- Entity = Represents ONE object → singular

---

## What Needs Fixing?

### ✅ Already Correct

- Database tables (singular)
- REST APIs (plural)
- Token storage (localStorage)
- Authorization (header, not URL)

### ❌ Needs Change

- Frontend: `/restaurant` → `/restaurants` (to match API)
- Menu: `/restaurant` → `/restaurants` (to match frontend)

---

## Next Steps

1. **Share URL screenshot** - so I can diagnose the state issue
2. **Approve plural routes** - to fix frontend/menu mismatch

**Once approved, I'll:**
- Rename frontend directory
- Update 11 internal links
- Provide SQL to update menu
- Fix URL state issue (once I see it)
- Complete in < 5 minutes

---

## Bottom Line

### Your Observations Were 100% Correct!

1. ✅ You were right to question tables being singular vs my doc
2. ✅ You were right to question state in URL
3. ✅ You were right to demand clear conventions

### My Corrections

1. ✅ Fixed documentation (tables should be singular)
2. ✅ Clarified token storage (not in URL)
3. ✅ Established final conventions standard

### Result

**Clear conventions for all future work!**
- No more confusion
- Automation-ready
- Consistent codebase

---

**Ready to proceed when you are!** 🎉

Just need:
1. URL screenshot (for state issue)
2. Approval to rename routes to plural
