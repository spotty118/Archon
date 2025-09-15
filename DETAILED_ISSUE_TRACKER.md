# Detailed Issue Tracker

## Issue Template Format

For each bug found, this document provides detailed tracking information that could be used to create GitHub issues.

---

## CRITICAL-001: OllamaModelDiscoveryModal Import/Export Mismatch

**Priority**: Critical  
**Severity**: Build Breaking  
**Component**: Frontend/Settings  
**Estimated Effort**: 5 minutes  

**Description**:
The OllamaModelDiscoveryModal component has inconsistent export/import patterns causing TypeScript compilation errors.

**Files Affected**:
- `archon-ui-main/src/components/settings/OllamaConfigurationPanel.tsx:9`
- `archon-ui-main/src/components/settings/OllamaModelDiscoveryModal.tsx:891`

**Error Message**:
```
error TS2614: Module '"./OllamaModelDiscoveryModal"' has no exported member 'OllamaModelDiscoveryModal'. Did you mean to use 'import OllamaModelDiscoveryModal from "./OllamaModelDiscoveryModal"' instead?
```

**Root Cause**:
Component is exported as default export but imported as named export.

**Fix Strategy**:
Change import statement from named to default import.

**Code Change Required**:
```typescript
// Before:
import { OllamaModelDiscoveryModal } from './OllamaModelDiscoveryModal';

// After:
import OllamaModelDiscoveryModal from './OllamaModelDiscoveryModal';
```

---

## CRITICAL-002: Invalid Button Variant Types

**Priority**: Critical  
**Severity**: Type Safety  
**Component**: Frontend/UI Components  
**Estimated Effort**: 15 minutes  

**Description**:
Multiple components use "solid" button variant which is not in the allowed Button component type union.

**Files Affected**:
- `archon-ui-main/src/components/settings/OllamaConfigurationPanel.tsx:702,714`
- `archon-ui-main/src/components/settings/OllamaModelDiscoveryModal.tsx:629,642,807,817`

**Error Message**:
```
error TS2322: Type '"outline" | "solid"' is not assignable to type '"outline" | "ghost" | "primary" | "secondary" | undefined'.
  Type '"solid"' is not assignable to type '"outline" | "ghost" | "primary" | "secondary" | undefined'.
```

**Root Cause**:
Button component type definition doesn't include "solid" variant.

**Fix Strategy**:
1. Either update Button component to support "solid" variant
2. Or change "solid" usage to "primary" throughout codebase

**Code Change Required**:
```typescript
// Replace all instances of:
variant={condition ? "solid" : "outline"}

// With:
variant={condition ? "primary" : "outline"}
```

---

## HIGH-001: Unsafe Property Access in Model Selection

**Priority**: High  
**Severity**: Runtime Safety  
**Component**: Frontend/Ollama  
**Estimated Effort**: 10 minutes  

**Description**:
Code accesses `model.details.format` without checking if `model.details` is an object or string.

**Files Affected**:
- `archon-ui-main/src/components/settings/OllamaModelSelectionModal.tsx:326,330`

**Error Message**:
```
Property 'format' does not exist on type 'string | { family?: string | undefined; parameter_size?: string | undefined; quantization?: string | undefined; format?: string | undefined; }'.
```

**Root Cause**:
Type union allows `model.details` to be either string or object, but code assumes object.

**Fix Strategy**:
Add type guard before property access.

**Code Change Required**:
```typescript
// Before:
model.details.format

// After:
typeof model.details === 'object' && model.details?.format
```

---

## HIGH-002: Missing Service Import

**Priority**: High  
**Severity**: Build Breaking  
**Component**: Frontend/Types  
**Estimated Effort**: 5 minutes  

**Description**:
OllamaTypes.ts cannot find ollamaService module.

**Files Affected**:
- `archon-ui-main/src/components/settings/types/OllamaTypes.ts:166`

**Error Message**:
```
error TS2307: Cannot find module '../../services/ollamaService' or its corresponding type declarations.
```

**Root Cause**:
Import path is incorrect or service file is missing.

**Fix Strategy**:
1. Verify ollamaService.ts exists at correct path
2. Fix import path if incorrect
3. Create service file if missing

---

## MEDIUM-001: Production Debug Console Statements

**Priority**: Medium  
**Severity**: Code Quality  
**Component**: Frontend/Multiple  
**Estimated Effort**: 30 minutes  

**Description**:
30+ console.log statements left in production code across multiple components.

**Files Affected**:
- `archon-ui-main/src/components/settings/OllamaModelDiscoveryModal.tsx` (25+ statements)
- `archon-ui-main/src/components/settings/OllamaModelSelectionModal.tsx` (10+ statements)
- Multiple other files

**Impact**:
- Console pollution
- Potential performance impact
- Security concerns (information leakage)

**Fix Strategy**:
1. Remove all console.log statements in production code
2. Implement proper logging service if needed
3. Use development-only conditional logging

**Code Pattern to Remove**:
```typescript
console.log('🔴 COMPONENT DEBUG: ...');
console.log('🚨 DEBUG: ...');
console.log('🎨 DEBUG: ...');
```

---

## MEDIUM-002: Unused Variables Throughout Codebase

**Priority**: Medium  
**Severity**: Code Quality  
**Component**: Frontend/Multiple  
**Estimated Effort**: 20 minutes  

**Description**:
Multiple TypeScript strict mode violations due to unused variables.

**Files Affected**:
- `OllamaConfigurationPanel.tsx`: 6 unused variables
- `OllamaModelDiscoveryModal.tsx`: 5 unused variables  
- `OllamaModelSelectionModal.tsx`: 3 unused variables

**Fix Strategy**:
1. Remove truly unused variables
2. Prefix with underscore for intentionally unused parameters
3. Use TypeScript ignore comments sparingly if needed

**Example Fix**:
```typescript
// Before:
const [loading, setLoading] = useState(true);

// After (if truly unused):
// Remove the line entirely

// After (if parameter must exist):
const [_loading, setLoading] = useState(true);
```

---

## MEDIUM-003: Missing React Hook Dependencies

**Priority**: Medium  
**Severity**: React Best Practices  
**Component**: Frontend/Settings  
**Estimated Effort**: 10 minutes  

**Description**:
useCallback and useEffect hooks missing dependencies causing potential stale closures.

**Files Affected**:
- `archon-ui-main/src/components/settings/OllamaConfigurationPanel.tsx:319,442`

**Warning Message**:
```
React Hook useCallback has a missing dependency: 'loadInstances'. Either include it or remove the dependency array.
```

**Fix Strategy**:
Add missing dependencies to hook dependency arrays.

**Code Change Required**:
```typescript
// Before:
useCallback(() => { /* uses loadInstances */ }, []);

// After:
useCallback(() => { /* uses loadInstances */ }, [loadInstances]);
```

---

## LOW-001: Commented Error Logging in Error Boundary

**Priority**: Low  
**Severity**: Debugging  
**Component**: Frontend/Error Handling  
**Estimated Effort**: 2 minutes  

**Description**:
Error boundary has commented out error logging reducing debuggability.

**Files Affected**:
- `archon-ui-main/src/components/bug-report/ErrorBoundaryWithBugReport.tsx:22,44`

**Issue**:
```typescript
// console.error("ErrorBoundary caught an error:", error, errorInfo);
// console.error("Failed to collect bug context:", contextError);
```

**Fix Strategy**:
Uncomment error logging or replace with proper logging service.

---

## LOW-002: Deprecated Dependencies

**Priority**: Low  
**Severity**: Security/Maintenance  
**Component**: Frontend/Dependencies  
**Estimated Effort**: 30 minutes  

**Description**:
Multiple deprecated npm packages with security vulnerabilities.

**Files Affected**:
- `archon-ui-main/package.json`

**Issues Found**:
- ESLint 8.57.1 (deprecated, no longer supported)
- 3 npm audit vulnerabilities (1 low, 2 moderate)
- rimraf@3.0.2, inflight@1.0.6, glob@7.2.3 (deprecated)

**Fix Strategy**:
1. Upgrade ESLint to v9+
2. Run `npm audit fix`
3. Update deprecated dependencies to modern versions

---

## BACKEND-001: Incomplete Ollama Multi-Instance Support

**Priority**: Medium  
**Severity**: Feature Incomplete  
**Component**: Backend/LLM Service  
**Estimated Effort**: 2-4 hours  

**Description**:
TODO comment indicates incomplete implementation of multi-instance Ollama support.

**Files Affected**:
- `python/src/server/services/llm_provider_service.py`

**TODO Comment**:
```python
# TODO: Implement get_ollama_instances() method in CredentialService for multi-instance support
```

**Fix Strategy**:
Implement the get_ollama_instances() method in CredentialService.

---

## BACKEND-002: MCP API Placeholder Implementations

**Priority**: Medium  
**Severity**: Feature Incomplete  
**Component**: Backend/MCP  
**Estimated Effort**: 1-2 hours  

**Description**:
MCP API has placeholder implementations for client detection and session tracking.

**Files Affected**:
- `python/src/server/api_routes/mcp_api.py`

**TODO Comments**:
```python
# TODO: Implement real client detection in the future
"active_sessions": 0,  # TODO: Implement real session tracking
```

**Fix Strategy**:
Implement proper client detection and session tracking mechanisms.

## Summary Statistics

**Total Issues Catalogued**: 15 detailed issues  
**Critical**: 2 issues  
**High**: 2 issues  
**Medium**: 6 issues  
**Low**: 2 issues  
**Backend**: 3 issues  

**Estimated Total Fix Time**: 4-6 hours for all issues  
**Estimated Critical Fix Time**: 20 minutes  

Each issue has been analyzed with specific file locations, error messages, root causes, and concrete fix strategies to enable efficient bug resolution.