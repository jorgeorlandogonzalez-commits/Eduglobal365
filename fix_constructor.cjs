const fs = require('fs');

let code = fs.readFileSync('components/ConstructorLab.tsx', 'utf8');

code = code.replace(
  /const \[profile, setProfile\] = useState<BuilderProfile>\(\(\) => \{[\s\S]*?\}\);/g,
  `const [profile, setProfile] = useState<BuilderProfile>({
    name: 'Constructor Anon',
    focusArea: 'General',
    level: 1,
    projectsCompleted: 0
  });`
);

code = code.replace(
  /useEffect\(\(\) => \{\n    setProjects\(StorageService\.getBuilderProjects\(\)\);\n  \}, \[\]\);/g,
  `useEffect(() => {
    async function loadData() {
      const savedProfile = await StorageService.loadBuilderProfile();
      if (savedProfile) {
        setProfile(savedProfile);
      }
      const projs = await StorageService.getBuilderProjects();
      setProjects(projs);
    }
    loadData();
  }, []);`
);

// handleCreateProject
code = code.replace(
  /StorageService\.saveBuilderProject\(projectToSave\);[\s\S]*?setProjects\(StorageService\.getBuilderProjects\(\)\);/g,
  `await StorageService.saveBuilderProject(projectToSave);
    const projs = await StorageService.getBuilderProjects();
    setProjects(projs);`
);

code = code.replace(
  /const handleCreateProject = \(e: React\.FormEvent\) => \{/g,
  `const handleCreateProject = async (e: React.FormEvent) => {`
);


// handleDeleteProject
code = code.replace(
  /StorageService\.deleteBuilderProject\(id\);[\s\S]*?setProjects\(StorageService\.getBuilderProjects\(\)\);/g,
  `await StorageService.deleteBuilderProject(id);
    const projs = await StorageService.getBuilderProjects();
    setProjects(projs);`
);

code = code.replace(
  /const handleDeleteProject = \(id: string\) => \{/g,
  `const handleDeleteProject = async (id: string) => {`
);

fs.writeFileSync('components/ConstructorLab.tsx', code);
