const fs = require('fs');
let content = fs.readFileSync('components/ConstructorLab.tsx', 'utf8');

const oldEffect = `  useEffect(() => {
    const loadedProfile = StorageService.loadBuilderProfile() || {
      name: 'Constructor',
      focusArea: 'Desarrollo Web',
      level: 1,
      projectsCompleted: 0
    };
    setProfile(loadedProfile);
    setProjects(StorageService.getBuilderProjects());
  }, []);`;

const newEffect = `  useEffect(() => {
    async function loadData() {
      const loadedProfile = await StorageService.loadBuilderProfile() || {
        name: 'Constructor',
        focusArea: 'Desarrollo Web',
        level: 1,
        projectsCompleted: 0
      };
      setProfile(loadedProfile);
      const proj = await StorageService.getBuilderProjects();
      setProjects(proj || []);
    }
    loadData();
  }, []);`;

content = content.replace(oldEffect, newEffect);

fs.writeFileSync('components/ConstructorLab.tsx', content);
