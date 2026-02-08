# Missing shadcn/ui Components

## Components Needed

Our custom components reference these shadcn/ui components. Run these commands to install them:

### Required Components

```bash
# Navigate to project directory
cd /home/sivakumar/Shiva/Workspace/rms-web-app

# Install required shadcn/ui components
npx shadcn-ui@latest add label
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
```

### Already Installed

✅ Button - Already exists

### Component Status

| Component | Status | Used By |
|-----------|--------|---------|
| **Button** | ✅ Installed | FormActions, PageHeader, DataTable |
| **Label** | ⚠️ Need to install | TextField, TextAreaField, SelectField, CheckboxField, NumberField |
| **Input** | ⚠️ Need to install | TextField, NumberField |
| **Card** | ⚠️ Need to install | FormSection |
| **Select** | ⚠️ Need to install | SelectField |
| **Checkbox** | ⚠️ Need to install | CheckboxField |
| **Table** | ⚠️ Need to install | DataTable |
| **Badge** | ⚠️ Need to install | DataTable examples |

## Installation Commands

Run all at once:

```bash
cd /home/sivakumar/Shiva/Workspace/rms-web-app && \
npx shadcn-ui@latest add label && \
npx shadcn-ui@latest add input && \
npx shadcn-ui@latest add card && \
npx shadcn-ui@latest add select && \
npx shadcn-ui@latest add checkbox && \
npx shadcn-ui@latest add table && \
npx shadcn-ui@latest add badge
```

## Verification

After installation, verify components exist:

```bash
ls -la components/ui/
```

You should see:
- label.tsx
- input.tsx
- card.tsx
- select.tsx
- checkbox.tsx
- table.tsx
- badge.tsx

## Alternative: Manual Installation

If shadcn CLI doesn't work, you can manually copy components from:
https://ui.shadcn.com/docs/components

Each component page has a "Manual Installation" section with the exact code.

## Notes

- These are one-time installations
- shadcn components are just React components added to your project
- They can be customized after installation
- No external dependencies added (uses Radix UI under the hood)
