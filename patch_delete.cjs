const fs = require('fs');
let content = fs.readFileSync('components/ConstructorLab.tsx', 'utf8');

const oldDelete = `  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      // TODO: Implement actual delete in FirestoreService. For now update local state
      const allProjects = projects.filter(p => p.id !== projectId);
    try {
      localStorage.setItem('eduglobal_builder_projects', JSON.stringify(allProjects));
    } catch (e) {
      console.warn('localStorage not accessible for project save');
    }
    }
  };`;

const newDelete = `  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      await StorageService.deleteBuilderProject(projectId);
    }
  };`;

content = content.replace(oldDelete, newDelete);
fs.writeFileSync('components/ConstructorLab.tsx', content);
