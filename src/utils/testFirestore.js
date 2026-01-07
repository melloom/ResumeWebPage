import { addProject, getProjects } from '../services/projectService';

export const testFirestore = async () => {
  console.log('🧪 Testing Firestore connection...');
  
  try {
    // Test adding a project
    const testProject = {
      title: 'Test Project',
      description: 'This is a test project to verify Firestore is working',
      overview: 'A simple test project to ensure the database connection is functional',
      keyFeatures: ['Test feature 1', 'Test feature 2'],
      technicalStack: ['React', 'Firebase'],
      githubLink: 'https://github.com/test',
      liveLink: 'https://test.com',
      imageUrl: '/images/default-project.jpg'
    };

    console.log('📝 Adding test project...');
    const addResult = await addProject(testProject);
    
    if (addResult.success) {
      console.log('✅ Test project added successfully!');
      console.log('Project ID:', addResult.projectId);
    } else {
      console.error('❌ Failed to add test project:', addResult.error);
      return false;
    }

    // Test getting projects
    console.log('📖 Fetching projects...');
    const getResult = await getProjects();
    
    if (getResult.success) {
      console.log('✅ Projects fetched successfully!');
      console.log('Number of projects:', getResult.projects.length);
      console.log('Projects:', getResult.projects);
    } else {
      console.error('❌ Failed to fetch projects:', getResult.error);
      return false;
    }

    console.log('🎉 Firestore test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    return false;
  }
}; 