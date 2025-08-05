import React,{useContext,useState,useEffect} from 'react'
import { UserContext } from '../context/user.context';
import { Plus,User } from 'lucide-react';
import axiosInstance from '../config/axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const {user} = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);

  const navigate = useNavigate();

  function handleCreateProject() {
    setShowModal(true);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({projectName});
    setProjectName("");
    axiosInstance.post('/projects/create', { name: projectName }).then(response => {
      console.log('Project created:', response.data);
      setShowModal(false);
      fetchProjects();
    }).catch(error => {
      console.error('Error creating project:', error);
    });
  };

  const fetchProjects = () => {
    axiosInstance.get('/projects/all').then(response => {
      console.log('All projects:', response.data.projects);
      setProject(response.data.projects);
    }).catch(error => {
      console.error('Error fetching projects:', error);
    });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectClick = (item) => {
    console.log("=== NAVIGATION DEBUG ===");
    console.log("Project item being passed:", item);
    console.log("Project ID:", item._id);
    console.log("Project name:", item.name);
    console.log("About to navigate to /project with state:", { project: item });

    try {
      navigate('/project', {
        state: { project: item }
      });
      console.log("Navigation called successfully");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // Alternative method using URL params
  const handleProjectClickWithParams = (item) => {
    console.log("=== URL PARAMS NAVIGATION ===");
    console.log("Navigating with URL params:", item._id);
    navigate(`/project/${item._id}`);
  };

  return (
    <main className="p-4">
      <div className="projects flex flex-wrap gap-4">
        <button
          onClick={handleCreateProject}
          className="project p-4 border-2 border-slate-300 rounded-md hover:bg-slate-100"
        >
          <Plus />
        </button>
        {project.map((item) => (
          <div key={item._id} className="project flex flex-col gap-3 p-4 border-2 border-slate-300 rounded-md hover:bg-slate-100 min-w-[15vw]">
            <h3 className="text-lg font-bold">{item.name}</h3>
            <div className="flex items-center gap-2">
              <User/>
              <span>{item.users.length}</span>
            </div>
            <div className="flex gap-2 mt-2">
              {/* Original method with state */}
              <button
                onClick={() => handleProjectClick(item)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full p-2 border rounded mb-4"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home