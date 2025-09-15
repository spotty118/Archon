# Archon Bug Report - Comprehensive List

This document catalogs all bugs, issues, and technical debt found in the Archon codebase during analysis on 2024-12-28.

## 🚨 Critical Bugs (Must Fix)

### 1. Import/Export Inconsistency - OllamaModelDiscoveryModal
**File**: `archon-ui-main/src/components/settings/OllamaConfigurationPanel.tsx:9`
**Issue**: Component imports OllamaModelDiscoveryModal as named export but it's exported as default
```typescript
// Current (broken):
import { OllamaModelDiscoveryModal } from './OllamaModelDiscoveryModal';

// Should be:
import OllamaModelDiscoveryModal from './OllamaModelDiscoveryModal';
```
**Impact**: TypeScript compilation error preventing build
**Category**: Build Breaking

### 2. Invalid Button Variant Types
**Files**: 
- `archon-ui-main/src/components/settings/OllamaConfigurationPanel.tsx:702,714`
- `archon-ui-main/src/components/settings/OllamaModelDiscoveryModal.tsx:629,642,807,817`

**Issue**: Using "solid" variant which is not in allowed Button component types
```typescript
// Current (broken):
variant={isChatSelected ? "solid" : "outline"}

// Should be one of: "outline" | "ghost" | "primary" | "secondary"
variant={isChatSelected ? "primary" : "outline"}
```
**Impact**: TypeScript compilation errors, potential runtime issues
**Category**: Type Safety

### 3. Unsafe Property Access
**File**: `archon-ui-main/src/components/settings/OllamaModelSelectionModal.tsx:326,330`
**Issue**: Accessing `.format` property without type guard
```typescript
// Current (unsafe):
model.details.format

// Needs type guard:
typeof model.details === 'object' && model.details?.format
```
**Impact**: Runtime errors if model.details is string instead of object
**Category**: Runtime Safety

## ⚠️ High Priority Issues

### 4. Missing Service Import
**File**: `archon-ui-main/src/components/settings/types/OllamaTypes.ts:166`
**Issue**: Cannot find module '../../services/ollamaService'
**Impact**: TypeScript compilation error
**Category**: Build Breaking

### 5. Unused Variable Violations (TypeScript Strict Mode)
**Files**: Multiple files with unused variables that violate @typescript-eslint/no-unused-vars
- `OllamaConfigurationPanel.tsx`: `OllamaInstanceType`, `loading`, `discoveringModels`, `setDiscoveringModels`, `modelDiscoveryResults`, `setModelDiscoveryResults`
- `OllamaModelDiscoveryModal.tsx`: `Zap`, `Clock`, `Filter`, `Download`, `ModelDiscoveryResponse`
- `OllamaModelSelectionModal.tsx`: `Server`, `Box`, `Input`

**Impact**: Build failures in strict TypeScript environments
**Category**: Code Quality

### 6. Missing React Hook Dependencies
**Files**: 
- `archon-ui-main/src/components/settings/OllamaConfigurationPanel.tsx:319,442`
```typescript
// Missing 'loadInstances' in dependency arrays
useCallback(() => { /* ... */ }, []); // Should include loadInstances
useEffect(() => { /* ... */ }, []); // Should include loadInstances
```
**Impact**: Potential stale closures and incorrect behavior
**Category**: React Best Practices

### 7. Implicit Any Types
**Files**:
- `OllamaConfigurationPanel.tsx:40`: `any` type for modelDiscoveryResults
- `OllamaModelSelectionModal.tsx:808,856`: Parameters with implicit any type
- `OllamaModelSelectionModal.tsx:661`: Unknown property 'dimensions' in ModelInfo type

**Impact**: Loss of type safety, potential runtime errors
**Category**: Type Safety

## 🔧 Medium Priority Issues

### 8. Debug Console Statements in Production Code
**Files**: Over 30 console.log statements found across components
- `OllamaModelDiscoveryModal.tsx`: 25+ debug console statements
- `OllamaModelSelectionModal.tsx`: Multiple debug console statements
- `OllamaConfigurationPanel.tsx`: Debug logging

**Impact**: Console pollution, potential performance impact, security concerns
**Category**: Code Quality

### 9. TODO/FIXME Comments Indicating Incomplete Features
**Backend Files**:
- `python/src/server/services/llm_provider_service.py`: "TODO: Implement get_ollama_instances() method"
- `python/src/server/api_routes/mcp_api.py`: "TODO: Implement real client detection"
- `python/src/mcp_server/mcp_server.py`: Multiple TODO comments about task management

**Frontend Files**:
- `archon-ui-main/src/features/projects/shared/apiWithEtag.ts`: Debug flags
- Multiple DEBUG flags and temporary code

**Impact**: Incomplete functionality, maintenance debt
**Category**: Technical Debt

### 10. Error Boundary Issues
**File**: `archon-ui-main/src/components/bug-report/ErrorBoundaryWithBugReport.tsx`
**Issue**: Commented out console.error statements in error handling
```typescript
// console.error("ErrorBoundary caught an error:", error, errorInfo);
// console.error("Failed to collect bug context:", contextError);
```
**Impact**: Reduced debuggability when errors occur
**Category**: Debugging/Monitoring

## 🔍 Low Priority / Code Quality Issues

### 11. Deprecated Dependencies
**File**: `archon-ui-main/package.json`
**Issues**: 
- ESLint 8.57.1 (deprecated, should upgrade to v9+)
- Various npm audit warnings (rimraf@3.0.2, inflight@1.0.6, glob@7.2.3)

**Impact**: Security vulnerabilities, outdated tooling
**Category**: Dependencies

### 12. Memory Leaks in Progress Tracking
**File**: `python/src/server/utils/progress/progress_tracker.py`
**Issue**: Debug logging may accumulate in production
**Impact**: Potential memory usage increase
**Category**: Performance

### 13. Incomplete Error Handling
**File**: `archon-ui-main/src/services/bugReportService.ts`
**Issue**: Generic catch blocks without specific error handling
```typescript
} catch {
  // Health checks failed - services will remain false
}
```
**Impact**: Silent failures, difficult debugging
**Category**: Error Handling

## 📊 Bug Summary by Category

| Category | Count | Severity |
|----------|-------|----------|
| Build Breaking | 3 | Critical |
| Type Safety | 4 | High |
| Runtime Safety | 1 | High |
| React Best Practices | 1 | High |
| Code Quality | 30+ | Medium |
| Technical Debt | 10+ | Medium |
| Dependencies | 5 | Low |
| Performance | 2 | Low |
| Error Handling | 3 | Low |

**Total Issues Found**: 50+ distinct bugs and code quality issues

## 🛠️ Recommended Fix Priority

1. **Phase 1 (Critical)**: Fix import/export issues and TypeScript compilation errors
2. **Phase 2 (High)**: Address type safety issues and React hook dependencies  
3. **Phase 3 (Medium)**: Remove debug console statements and implement TODOs
4. **Phase 4 (Low)**: Update dependencies and improve error handling

## 🧪 Testing Implications

Many of these bugs would be caught by:
- Stricter TypeScript configuration
- Enhanced ESLint rules
- Comprehensive unit tests
- Integration tests for component interactions
- Type checking in CI/CD pipeline

## 📝 Notes

This analysis was performed on the main branch as of 2024-12-28. The bugs range from critical build-breaking issues to minor code quality improvements. Addressing the critical and high priority issues would significantly improve the stability and maintainability of the Archon codebase.