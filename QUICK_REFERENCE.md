# GoalsArchitect - Quick Reference Guide

## 📂 Visual File Tree

```
GoalsArchitect/
│
├── 📁 src/                          # Main source code
│   ├── 📁 components/               # React components
│   │   ├── index.ts                 # Re-exports all components
│   │   ├── 📁 ui/                   # Basic UI components
│   │   │   ├── Header.tsx           # App header/navigation
│   │   │   └── GoalForm.tsx         # Goal input form
│   │   ├── 📁 modals/               # Modal dialogs
│   │   │   └── HistoryModal.tsx     # Plan history viewer
│   │   └── 📁 plan/                 # Plan management features
│   │       ├── index.ts             # Re-exports plan components
│   │       ├── PlanView.tsx         # Main plan container
│   │       ├── TaskItem.tsx         # Individual task component
│   │       ├── ListView.tsx         # Expandable list view
│   │       └── GridView.tsx         # Calendar grid view
│   │
│   ├── 📁 services/                 # External service integrations
│   │   └── geminiService.ts         # Google Gemini AI service
│   │
│   ├── 📁 types/                    # TypeScript type definitions
│   │   ├── index.ts                 # Re-exports all types
│   │   ├── task.ts                  # Task types
│   │   ├── plan.ts                  # Plan types
│   │   ├── history.ts               # History types
│   │   └── duration.ts              # Duration type
│   │
│   ├── 📁 hooks/                    # Custom React hooks
│   │   ├── index.ts                 # Re-exports all hooks
│   │   ├── useUndoRedo.ts           # Undo/redo state management
│   │   └── useLocalStorage.ts       # localStorage wrapper
│   │
│   ├── 📁 utils/                    # Utility functions
│   │   ├── index.ts                 # Re-exports all utilities
│   │   ├── helpers.ts               # General helpers
│   │   ├── calculations.ts          # Math/logic utilities
│   │   ├── export.ts                # Export/download utilities
│   │   └── storage.ts               # localStorage utilities
│   │
│   ├── 📁 constants/                # Global constants (future use)
│   ├── 📁 contexts/                 # React Context providers (future use)
│   ├── 📁 styles/                   # CSS modules (future use)
│   │
│   ├── App.tsx                      # Main app component
│   └── index.tsx                    # React DOM root
│
├── 📄 index.html                    # HTML entry point (updated)
├── 📄 vite.config.ts                # Vite configuration (updated)
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 package.json                  # Dependencies
├── 📄 electron.js                   # Electron main process
├── 📄 README.md                     # Project readme
│
├── 📄 PROJECT_STRUCTURE.md          # 📖 Detailed structure documentation
├── 📄 MIGRATION_GUIDE.md            # 📖 Migration instructions
└── 📄 RESTRUCTURING_SUMMARY.md      # 📖 This restructuring overview
```

## 🎯 Import Cheat Sheet

### Import Components
```typescript
import { Header, GoalForm, HistoryModal, PlanView } from './components';
```

### Import Types
```typescript
import { Duration, Task, PlanState, GeneratedPlan, HistoryItem } from './types';
```

### Import Hooks
```typescript
import { useUndoRedo, useLocalStorage } from './hooks';
```

### Import Utilities
```typescript
import { 
  generateId,                    // from helpers.ts
  calculateProgress,             // from calculations.ts
  formatPlanAsMarkdown,          // from export.ts
  downloadFile,                  // from export.ts
  loadHistoryFromStorage,        // from storage.ts
  saveHistoryToStorage,          // from storage.ts
  formatDate                     // from storage.ts
} from './utils';
```

### Import Services
```typescript
import { generatePlan, breakDownTask } from './services/geminiService';
```

## 🔄 Data Flow

```
User Input
    ↓
GoalForm.tsx (component)
    ↓
handleGenerate() → generatePlan() (service)
    ↓
API Response
    ↓
Transform with generateIdHelper() (utility)
    ↓
App.tsx State (useState)
    ↓
PlanView.tsx (component)
    ↓
ListView.tsx OR GridView.tsx (view component)
    ↓
TaskItem.tsx (renders individual tasks)
    ↓
User Actions (checkbox, expand, etc.)
```

## 📊 What Lives Where

### Components (`src/components/`)
- React components that render UI
- Stateless or stateful UI logic
- Event handlers that call App.tsx functions

### Services (`src/services/`)
- External API calls (Gemini AI)
- Complex business logic
- Data transformation

### Types (`src/types/`)
- TypeScript interfaces
- Type definitions
- Shared type definitions

### Hooks (`src/hooks/`)
- Custom React hooks
- State management logic
- localStorage integration

### Utils (`src/utils/`)
- Pure functions
- Calculations
- Formatting
- Helpers

## 🚀 Common Tasks

### Adding a New Page/Feature
1. Create folder in `src/components/` (e.g., `src/components/settings/`)
2. Create component files inside
3. Export from local `index.ts`
4. Add export to parent `src/components/index.ts`

### Adding a New API Service
1. Create file in `src/services/` (e.g., `notificationService.ts`)
2. Export functions as named exports
3. Import in `App.tsx` or components as needed

### Adding a New Utility
1. Create file in `src/utils/` organized by purpose
2. Export functions as named exports
3. Add to `src/utils/index.ts` exports

### Adding a New Hook
1. Create file in `src/hooks/` (e.g., `useNotifications.ts`)
2. Export hook as named export
3. Add to `src/hooks/index.ts` exports

### Adding New Types
1. Create file in `src/types/` (e.g., `notification.ts`)
2. Export interfaces as named exports
3. Add to `src/types/index.ts` exports

## 📈 Scalability Features

### Current
- ✅ 50+ utility functions organized by concern
- ✅ 8 organized components
- ✅ 5 domain-specific type definitions
- ✅ 2 custom hooks
- ✅ 1 external service

### Ready to Add
- 📦 React Context providers (`src/contexts/`)
- 📦 Global constants (`src/constants/`)
- 📦 CSS modules (`src/styles/`)
- 📦 Additional services
- 📦 Additional custom hooks
- 📦 Page-based routing

## 🔐 Type Safety

All major features are fully typed:
- ✅ Components with `React.FC<Props>`
- ✅ Hooks with proper return types
- ✅ Services with strong typing
- ✅ Utilities with typed parameters/returns

## ⚡ Performance Optimizations

Components are set up for:
- ✅ Code splitting (Vite handles automatically)
- ✅ Lazy imports (React.lazy ready)
- ✅ Memo optimization (TaskItem uses React.memo)
- ✅ Efficient re-renders

## 🧪 Testing Ready

Structure supports:
- ✅ Unit tests for utilities
- ✅ Hook tests with @testing-library/react
- ✅ Component snapshot tests
- ✅ Service mocking
- ✅ Integration tests

## 📚 Documentation Files

1. **README.md** - Project overview
2. **PROJECT_STRUCTURE.md** - Detailed documentation
3. **MIGRATION_GUIDE.md** - How the structure changed
4. **RESTRUCTURING_SUMMARY.md** - What was done
5. **QUICK_REFERENCE.md** - This file!

## 🎓 Learning Path

For new developers:
1. Start with this QUICK_REFERENCE.md
2. Read PROJECT_STRUCTURE.md for details
3. Check MIGRATION_GUIDE.md for context
4. Explore `src/components/index.ts` to see available components
5. Look at `src/types/index.ts` to see available types
6. Browse specific folders for implementation details

## 💡 Best Practices

1. **Always use central exports**: 
   ```typescript
   // ✅ Good
   import { Header, GoalForm } from './components';
   
   // ❌ Avoid
   import { Header } from './components/ui/Header';
   ```

2. **Keep utilities pure**:
   - No side effects
   - Testable in isolation
   - Reusable across components

3. **Co-locate related code**:
   - Component + styles in same folder
   - Related hooks together
   - Domain-specific types together

4. **Use TypeScript features**:
   - Strong typing prevents bugs
   - IDE intellisense works better
   - Self-documenting code

5. **Component responsibility**:
   - One component = one responsibility
   - Use composition for complexity
   - Keep state management centralized in App.tsx

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Component import fails | Check `src/components/index.ts` has export |
| Type not found | Verify `src/types/index.ts` exports it |
| Hook error | Ensure hook is exported from `src/hooks/index.ts` |
| Build fails | Run `npm install` and `npm run dev` |
| Old imports break | Update paths to use new folder structure |

## 📞 Quick Links

- Detailed Structure: `PROJECT_STRUCTURE.md`
- Migration Info: `MIGRATION_GUIDE.md`
- Full Summary: `RESTRUCTURING_SUMMARY.md`
- Main App: `src/App.tsx`
- Components: `src/components/`
- Utilities: `src/utils/`

---

**Last Updated**: 2025  
**Structure Version**: 2.0 (Modular/Scalable)  
**Status**: ✅ Production Ready
