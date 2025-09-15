import { KnowledgeViewWithBoundary } from '../features/knowledge';

// Minimal wrapper for routing compatibility
// All implementation is in features/knowledge/components/KnowledgeView.tsx
// Uses KnowledgeViewWithBoundary for proper error handling

function KnowledgeBasePage(): React.JSX.Element {
  return <KnowledgeViewWithBoundary />;
}

export { KnowledgeBasePage };