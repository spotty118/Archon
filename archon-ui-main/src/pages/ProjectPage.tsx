import { ProjectsViewWithBoundary } from '../features/projects';

// Minimal wrapper for routing compatibility
// All implementation is in features/projects/views/ProjectsView.tsx
// Uses ProjectsViewWithBoundary for proper error handling

function ProjectPage(): React.JSX.Element {
  return <ProjectsViewWithBoundary />;
}

export { ProjectPage };