# Migration Guide: Old Structure → New Modular Structure

## Summary of Changes

Your GoalsArchitect project has been reorganized from a flat structure to a scalable modular architecture.

### What Changed

#### Before (Flat Structure)
```
GoalsArchitect/
├── App.tsx
├── index.tsx
├── types.ts
├── electron.js
├── components/
│   ├── GoalForm.tsx
│   ├── Header.tsx
│   ├── HistoryModal.tsx
│   └── PlanView.tsx
└── services/
    └── geminiService.ts
```

#### After (Modular Structure)
```
GoalsArchitect/
└── src/
    ├── App.tsx
    ├── index.tsx
    ├── components/
    │   ├── ui/
    │   ├── modals/
    │   └── plan/
    ├── services/
    ├── types/
    ├── hooks/
    ├── utils/
    └── [other organized folders]
```

## Why This Matters

### Scalability Benefits
1. **Easier Feature Addition**: New features have a clear home
2. **Better Organization**: Related code lives together
3. **Improved Collaboration**: Team members can work independently
4. **Reduced Merge Conflicts**: Clear file organization
5. **Better Testing**: Isolated utilities are easier to test

### Maintainability Benefits
1. **Discoverability**: Easy to find where code lives
2. **Type Safety**: Organized types prevent duplication
3. **Reusability**: Utilities and hooks are isolated and composable
4. **Clear Dependencies**: Explicit imports show relationships

## Breaking Changes

### ⚠️ Import Updates Required

If you have any other files that import from this project, update them:

**Old:**
```typescript
import { Header } from './components/Header';
import { generatePlan } from './services/geminiService';
import { Duration, PlanState } from './types';
```

**New:**
```typescript
import { Header } from './components';
import { generatePlan } from './services/geminiService';
import { Duration, PlanState } from './types';
```

### Updated Entry Points

- **HTML Entry**: `index.html` now references `./src/index.tsx`
- **React Root**: `src/index.tsx` (moved into src/)
- **App Component**: `src/App.tsx` (moved into src/)

## Migration Checklist

- [x] Directory structure created
- [x] Components reorganized into logical folders
- [x] Types split into domain-specific modules
- [x] Services organized
- [x] Custom hooks extracted
- [x] Utilities organized by concern
- [x] All imports updated
- [x] Entry points configured
- [x] Vite config updated
- [x] No compilation errors

## Old Files to Clean Up

You can safely delete the old files:
- ❌ `App.tsx` (root level) - Use `src/App.tsx` instead
- ❌ `index.tsx` (root level) - Use `src/index.tsx` instead
- ❌ `types.ts` (root level) - Use `src/types/` instead
- ❌ `components/` folder - Components now in `src/components/`
- ❌ `services/` folder - Services now in `src/services/`

Keep these files:
- ✅ `index.html` (updated to reference new paths)
- ✅ `vite.config.ts` (updated)
- ✅ `tsconfig.json`
- ✅ `package.json`
- ✅ `electron.js` (if used)

## Component Organization Details

### UI Components (`src/components/ui/`)
Small, reusable components:
- `Header.tsx` - Navigation and branding
- `GoalForm.tsx` - Goal input form

### Modals (`src/components/modals/`)
Dialog and overlay components:
- `HistoryModal.tsx` - Plan history management

### Plan Components (`src/components/plan/`)
Feature-specific plan management:
- `PlanView.tsx` - Main plan display container
- `TaskItem.tsx` - Individual task rendering
- `ListView.tsx` - Expandable list view
- `GridView.tsx` - Calendar grid view

## Type Organization

Types are now split by domain:

```typescript
// src/types/duration.ts
export type Duration = string;

// src/types/task.ts
export interface Task { ... }
export interface GeneratedTask { ... }

// src/types/plan.ts
export interface PlanState { ... }
export interface GeneratedPlan { ... }

// src/types/history.ts
export interface HistoryItem { ... }

// src/types/index.ts (central export)
export * from './task';
export * from './plan';
export * from './history';
export * from './duration';
```

Import everything from `src/types`:
```typescript
import { Duration, Task, PlanState, HistoryItem } from './types';
```

## Utility Organization

Functions are organized by concern:

```typescript
// src/utils/helpers.ts - Basic utilities
export const generateId = () => { ... }
export const cleanJson = (text: string) => { ... }

// src/utils/calculations.ts - Math/logic utilities
export const countTasks = (tasks) => { ... }
export const calculateProgress = (days) => { ... }

// src/utils/export.ts - Export/download utilities
export const formatPlanAsMarkdown = (plan, progress) => { ... }
export const downloadFile = (content, filename) => { ... }

// src/utils/storage.ts - localStorage utilities
export const loadHistoryFromStorage = () => { ... }
export const saveHistoryToStorage = (history) => { ... }
```

Import what you need:
```typescript
import { generateId, calculateProgress, downloadFile } from './utils';
```

## Custom Hooks

Two new custom hooks have been created:

### `useUndoRedo` Hook
Manages undo/redo state for plans:
```typescript
import { useUndoRedo } from './hooks';

const { state, setState, commit, undo, redo, canUndo, canRedo } = useUndoRedo(initialState);
```

### `useLocalStorage` Hook
Type-safe localStorage wrapper:
```typescript
import { useLocalStorage } from './hooks';

const [value, setValue] = useLocalStorage('key', initialValue);
```

## Vite Configuration

The `vite.config.ts` has been updated with path aliases:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

This allows for cleaner imports in the future:
```typescript
// Future: import { Header } from '@/components';
```

## Development Commands

No changes to your existing scripts:
```bash
npm run dev      # Starts dev server
npm run build    # Builds for production
npm run preview  # Previews production build
```

## Common Questions

### Q: Can I still run the app?
**A:** Yes! The app functions identically. Only the file organization changed.

### Q: Do I need to update my build process?
**A:** No. Vite and the config handle everything automatically.

### Q: What about `electron.js`?
**A:** It remains unchanged at the root level and continues to work as before.

### Q: Can I add more folders later?
**A:** Absolutely! The structure is designed for growth. You can add:
- `src/constants/` for app-wide constants
- `src/contexts/` for React Context
- `src/styles/` for CSS modules
- `src/middleware/` for custom middleware

## Next Steps

1. **Verify Everything Works**: 
   ```bash
   npm run dev
   ```

2. **Test the App**: 
   - Generate a plan
   - Undo/redo changes
   - Save to history
   - Load from history
   - Download plan

3. **Clean Up Old Files** (optional):
   - Delete old root-level component files
   - Delete old root-level services folder
   - Keep only files listed in "Keep these files" section

4. **Update Any External References**:
   - If you have other projects importing from GoalsArchitect, update their imports

5. **Consider Git Cleanup**:
   - Commit this new structure
   - Delete old files in a separate commit

## Support

If you encounter any issues:
1. Check that all imports use the new paths
2. Verify that `src/` folder and all subfolders exist
3. Make sure `index.html` references `./src/index.tsx`
4. Run `npm run dev` and check the terminal for errors

The PROJECT_STRUCTURE.md file contains detailed documentation of the new organization.
