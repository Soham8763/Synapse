import React,{useContext,useState} from 'react'
import { UserContext } from '../context/user.context';
import { Plus } from 'lucide-react';
import axiosInstance from '../config/axios';

const Home = () => {
  const {user} = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");

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
    }).catch(error => {
      console.error('Error creating project:', error);
    });
  };

  return (
    <main className="p-4">
      <div className="projects">
        <button
          onClick={handleCreateProject}
          className="project p-4 border-2 border-slate-300 rounded-md hover:bg-slate-100"
        >
          <Plus />
        </button>
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
  )
}

export default Home