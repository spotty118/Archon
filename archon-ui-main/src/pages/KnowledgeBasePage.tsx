import { KnowledgeViewWithBoundary } from '../features/knowledge';

// Minimal wrapper for routing compatibility
// All implementation is in features/knowledge/components/KnowledgeView.tsx
// Uses KnowledgeViewWithBoundary for proper error handling

function KnowledgeBasePage(props: unknown): React.JSX.Element {
  return <KnowledgeViewWithBoundary {...props} />;
}

export { KnowledgeBasePage };