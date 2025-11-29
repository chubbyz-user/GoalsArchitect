# GoalsArchitect - Project Structure Documentation

## Overview
GoalsArchitect has been reorganized for scalability and maintainability using a modern modular architecture. This structure supports easy feature additions, testing, and team collaboration.

## Directory Structure

```
GoalsArchitect/
├── src/
│   ├── components/
│   │   ├── ui/                          # Reusable UI components
│   │   │   ├── Header.tsx              # Main app header with navigation
│   │   │   └── GoalForm.tsx            # Goal input form component
│   │   ├── modals/                     # Modal/dialog components
│   │   │   └── HistoryModal.tsx        # Plan history archive modal
│   │   ├── plan/                       # Plan display and management
│   │   │   ├── PlanView.tsx            # Main plan view container
│   │   │   ├── TaskItem.tsx            # Individual task/subtask component
│   │   │   ├── ListView.tsx            # Expandable list view for days
│   │   │   ├── GridView.tsx            # Calendar grid view
│   │   │   └── index.ts                # Component exports
│   │   └── index.ts                    # Central component exports
│   ├── services/
│   │   └── geminiService.ts            # AI plan generation service
│   ├── types/
│   │   ├── index.ts                    # Central type exports
│   │   ├── duration.ts                 # Duration type definitions
│   │   ├── task.ts                     # Task and GeneratedTask interfaces
│   │   ├── plan.ts                     # Plan and PlanState interfaces
│   │   └── history.ts                  # History item interface
│   ├── hooks/
│   │   ├── useUndoRedo.ts              # Undo/redo state management hook
│   │   ├── useLocalStorage.ts          # localStorage wrapper hook
│   │   └── index.ts                    # Hook exports
│   ├── utils/
│   │   ├── helpers.ts                  # Utility helper functions
│   │   ├── calculations.ts             # Progress calculation utilities
│   │   ├── export.ts                   # Export/download utilities
│   │   ├── storage.ts                  # localStorage utilities
│   │   └── index.ts                    # Utility exports
│   ├── constants/                      # (For future use)
│   ├── contexts/                       # (For future React Context API)
│   ├── styles/                         # (For future CSS modules)
│   ├── App.tsx                         # Main app component
│   └── index.tsx                       # React entry point
├── index.html                          # HTML entry point
├── vite.config.ts                      # Vite configuration
├── tsconfig.json                       # TypeScript configuration
├── package.json                        # Dependencies
└── README.md                           # Project documentation
```

## Key Directories

### `/src/components`
Organized by feature and responsibility:
- **`ui/`**: Atomic UI components (Header, Forms) that are reusable across the app
- **`modals/`**: Dialog/modal components for overlays and advanced interactions
- **`plan/`**: Feature-specific components for plan viewing and management

### `/src/services`
External API integrations and complex business logic:
- **`geminiService.ts`**: Handles all Gemini AI interactions (plan generation, task breakdown)

### `/src/types`
Type definitions organized by domain:
- **`task.ts`**: Task-related types (Task, GeneratedTask)
- **`plan.ts`**: Plan-related types (PlanState, GeneratedPlan, DayPlan)
- **`history.ts`**: History management types (HistoryItem)
- **`duration.ts`**: Duration type definition

### `/src/hooks`
Custom React hooks for state management:
- **`useUndoRedo.ts`**: Complete undo/redo functionality with stack management
- **`useLocalStorage.ts`**: Type-safe localStorage wrapper

### `/src/utils`
Pure utility functions organized by concern:
- **`helpers.ts`**: ID generation, JSON parsing helpers
- **`calculations.ts`**: Task counting, progress calculations
- **`export.ts`**: Plan formatting, file download functionality
- **`storage.ts`**: localStorage operations, date formatting

## Import Patterns

### Central Exports
Most modules re-export from a central `index.ts`, allowing clean imports:

```typescript
// Instead of:
import { Header } from './components/ui/Header';
import { GoalForm } from './components/ui/GoalForm';
import { HistoryModal } from './components/modals/HistoryModal';

// You can now do:
import { Header, GoalForm, HistoryModal } from './components';

// Or for types:
import { Duration, PlanState, Task } from './types';

// Or for utilities:
import { generateId, calculateProgress, downloadFile } from './utils';
```

## Dependencies

### Core
- **React 19.2.0**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server

### External Libraries
- **@google/genai**: Gemini AI integration
- **lucide-react**: Icon library
- **canvas-confetti**: Celebration effect
- **tailwindcss**: Styling (CDN-based)

## Architecture Principles

### 1. **Separation of Concerns**
- Components handle UI rendering
- Services handle external API calls
- Utils contain pure functions
- Hooks encapsulate stateful logic

### 2. **Scalability**
- Easy to add new features (create new component folder, add new service, etc.)
- Clear file organization makes navigation intuitive
- Modular structure prevents circular dependencies

### 3. **Type Safety**
- Organized type definitions prevent duplication
- Central type exports ensure consistency
- Domain-organized types improve discoverability

### 4. **Reusability**
- Utility functions are pure and composable
- Custom hooks abstract complex state logic
- UI components are decoupled from business logic

### 5. **Maintainability**
- Clear file naming conventions
- Single responsibility per file
- Central export files reduce import path complexity
- Documented structure

## Adding New Features

### Adding a New Component
1. Create folder in `src/components` following existing pattern
2. Implement component in dedicated file
3. Add export to local `index.ts` (if it's a container) and parent `index.ts`

### Adding a New Service
1. Create file in `src/services` (e.g., `analyticsService.ts`)
2. Export functions as named exports
3. Use consistently across app

### Adding a New Utility
1. Create file in `src/utils` organized by concern (e.g., `formatting.ts`)
2. Export functions as named exports
3. Add export to `src/utils/index.ts`

### Adding New Types
1. Create domain-specific file in `src/types` (e.g., `notification.ts`)
2. Export types as named exports
3. Add export to `src/types/index.ts`

### Adding a New Hook
1. Create file in `src/hooks` (e.g., `useNotification.ts`)
2. Export hook as default or named export
3. Add export to `src/hooks/index.ts`

## Future Enhancements

The current structure supports:
- **React Context**: Ready to use with `/src/contexts` folder
- **Global Styling**: CSS modules in `/src/styles` folder
- **Constants**: App-wide constants in `/src/constants` folder
- **Testing**: Easy to unit test isolated functions from utils, hooks, and services
- **Environment Config**: Ready for .env integration

## Migration Notes

This reorganization from the original flat structure:
- ✅ All imports updated to use new paths
- ✅ Entry point updated in `index.html`
- ✅ Vite config updated with path aliases support
- ✅ No breaking changes to functionality
- ✅ All original files can be removed after verification

## Development Workflow

### Starting Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm run preview
```

### Project Root Files Still Used
- `index.html`: Entry point (updated to reference `src/index.tsx`)
- `vite.config.ts`: Build configuration
- `tsconfig.json`: TypeScript settings
- `package.json`: Dependencies
