import { 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  orderBy,
  where
} from '../config/firebase';
import { auth } from '../config/firebase';

const PROJECTS_COLLECTION = 'projects';

// Add a new project to Firestore
export const addProject = async (projectData) => {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        error: 'Authentication required. Please log in first.'
      };
    }

    // Network is now enabled by default

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...projectData,
      createdBy: currentUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      projectId: docRef.id,
      project: { id: docRef.id, ...projectData }
    };
  } catch (error) {
    console.error('Error adding project:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get all projects from Firestore
export const getProjects = async () => {
  try {
    // Network is now enabled by default
    
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const projects = [];
    
    querySnapshot.forEach((doc) => {
      projects.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      projects
    };
  } catch (error) {
    console.error('Error getting projects:', error);
    return {
      success: false,
      error: error.message,
      projects: []
    };
  }
};

// Delete a project from Firestore
export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting project:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update a project in Firestore
export const updateProject = async (projectId, projectData) => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error updating project:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 