import React, { useState, useContext, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  User,
  Users,
  SendHorizontal,
  X,
  UserRoundCheck,
  UserPlus,
} from "lucide-react";
import axiosInstance from "../config/axios";
import { initializeSocket, recieveMessage, sendMessage } from "../config/socket";
import { UserContext } from '../context/user.context'
import { useRef } from "react";

const Projects = () => {
  const location = useLocation();
  const params = useParams();
  const [isSidePannelOpen, setIsSidePannelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [users, setUsers] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [project, setProject] = useState(location.state?.project || null);
  const [message, setMessage] = useState('');
  const messageBox = useRef();
  const { user } = useContext(UserContext);

  // First useEffect - handle project initialization
  useEffect(() => {
    const initializeProject = async () => {
      let projectData = null;

      if (location.state?.project) {
        console.log("Using project from location state");
        projectData = location.state.project;
      } else if (params.projectId) {
        console.log("Fetching project from URL params:", params.projectId);
        try {
          const response = await axiosInstance.get(`/projects/${params.projectId}`);
          console.log("Fetched project:", response.data);
          projectData = response.data.project;
        } catch (error) {
          console.error("Error fetching project:", error);
          return;
        }
      } else {
        console.error("No project data available from state or URL params");
        return;
      }

      // Set both project states
      setCurrentProject(projectData);
      setProject(projectData);
    };

    initializeProject();
  }, [location, params.projectId]);

  // Second useEffect - handle socket initialization and data fetching
  useEffect(() => {
    // Fetch all users (this doesn't depend on project)
    axiosInstance.get("/users/all")
      .then((response) => {
        console.log("All users:", response.data);
        setUsers(response.data.users);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });

    // Only initialize socket and fetch additional project data if we have a project
    if (project?._id) {
      console.log("Initializing socket for project:", project._id);
      const token = localStorage.getItem('token'); // or however you store your auth token
      initializeSocket(project._id, token);

      recieveMessage('project-message', data => {
        console.log("Received message:", data);
        appendIncomingMessage(data);
      });

      // Fetch latest project details
      axiosInstance.get(`/projects/get-project/${project._id}`)
        .then((response) => {
          console.log("Updated project data:", response.data.project);
          setProject(response.data.project);
        })
        .catch((error) => {
          console.error("Error fetching project details:", error);
        });
    }
  }, [project?._id]); // Re-run when project._id changes

  function send() {
    console.log('Send function called');
    console.log('Project state:', project);
    console.log('User state:', user);
    console.log('Message:', message);

    // Add null check before sending
    if (!project?._id) {
      console.error("Cannot send message: project not loaded");
      alert("Project not loaded yet. Please wait a moment and try again.");
      return;
    }

    if (!message.trim()) {
      console.error("Cannot send empty message");
      return;
    }

    if (!user?._id) {
      console.error("Cannot send message: user not loaded");
      return;
    }

    console.log('Sending message to project:', project._id);
    sendMessage('project-message', {
      message: message,
      sender: user,
      projectId: project._id // Add this for extra safety
    });
    appendOutgoingMessage(message);
    console.log('Message sent successfully');
    setMessage('');
  }

  function handleAddCollaborators() {
    let projectId = null;

    if (currentProject?._id) {
      projectId = currentProject._id;
      console.log("Using project ID from currentProject:", projectId);
    } else if (location.state?.project?._id) {
      projectId = location.state.project._id;
      console.log("Using project ID from location state:", projectId);
    } else if (params.projectId) {
      projectId = params.projectId;
      console.log("Using project ID from URL params:", projectId);
    }

    console.log("Final project ID:", projectId);

    if (!projectId) {
      console.error("Project ID not found anywhere");
      console.error("Current project:", currentProject);
      console.error("Location state:", location.state);
      console.error("URL params:", params);
      alert("Error: Project ID not found. Please try navigating to the project again.");
      return;
    }

    const userIds = Array.from(selectedUserId);
    console.log("Selected user IDs:", userIds);

    if (userIds.length === 0) {
      alert("Please select at least one user to add.");
      return;
    }

    axiosInstance.put("/projects/add-user", { projectId, users: userIds })
      .then((response) => {
        console.log("Users added to project:", response.data);
        setSelectedUserId(new Set());
        setIsModalOpen(false);
        // Optionally refresh project data
        axiosInstance.get(`/projects/get-project/${projectId}`)
          .then((response) => {
            setProject(response.data.project);
          });
      })
      .catch((error) => {
        console.error("Error adding users to project:", error);
        alert("Error adding users. Please try again.");
      });
  }

  // Show loading state if project is not loaded
  if (!project) {
    return (
      <main className="h-screen w-screen flex items-center justify-center">
        <div>Loading project...</div>
      </main>
    );
  }

  function appendIncomingMessage(messageObject) {
    const messageBox = document.querySelector(".message-box");
    const message = document.createElement("div");
    message.classList.add("message","max-w-56","flex","flex-col","p-3","mb-3","bg-white","border","border-gray-200","rounded-lg","shadow-sm");
    message.innerHTML = `
      <small class='text-gray-500 text-xs font-medium mb-1'>${messageObject.sender.email}</small>
      <p class='text-black text-sm leading-relaxed'>${messageObject.message}</p>
    `;
    messageBox.appendChild(message);
  }

  function appendOutgoingMessage(message) {
    const messageBox = document.querySelector(".message-box");
    const newMessage = document.createElement("div");
    newMessage.classList.add("ml-auto","message","max-w-56","flex","flex-col","p-3","mb-3","bg-white","border","border-blue-200","rounded-lg","shadow-sm");
    newMessage.innerHTML = `
      <small class='text-blue-600 text-xs font-medium mb-1'>${user.email}</small>
      <p class='text-black text-sm leading-relaxed'>${message}</p>
    `;
    messageBox.appendChild(newMessage);
  }
  return (
    <main className="h-screen w-screen flex">
      <section className="left relative h-full flex flex-col min-w-96 bg-slate-400">
        <header className="flex justify-between items-center p-4 w-full bg-slate-300">
          <div className="flex flex-col">
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer flex gap-2 mb-2"
            >
              <UserPlus className="mr-1" />
              <p>Add collaborator</p>
            </button>
            {(currentProject || project) && (
              <p className="text-sm text-gray-600">
                Project: {currentProject?.name || project?.name}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsSidePannelOpen(!isSidePannelOpen)}
            className="p-3 cursor-pointer"
          >
            <Users />
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col">
          <div ref={messageBox} className="message-box p-2 flex-grow flex flex-col gap-2"></div>
          <div className="input-field w-full flex gap-2 p-2">
            <input
              value={message}
              onChange={(e) => { setMessage(e.target.value) }}
              className="p-2 px-4 border-none outline-none flex-grow bg-slate-100 rounded-md"
              type="text"
              placeholder="Enter your Message"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  send();
                }
              }}
            />
            <button
              onClick={send}
              disabled={!message.trim() || !project?._id}
              className="p-2 rounded-md bg-slate-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendHorizontal className="text-white" />
            </button>
          </div>
        </div>

        <div
          className={`sidepannel w-full h-full bg-slate-50 flex flex-col gap-2 absolute top-0 left-0 transition-transform duration-300 ease-in-out ${
            isSidePannelOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <header className="flex justify-between items-center p-2 px-3 bg-slate-300 ">
            <h1 className="font-semibold text-lg">Collaborators</h1>
            <button
              onClick={() => setIsSidePannelOpen(!isSidePannelOpen)}
              className="cursor-pointer p-2"
            >
              <X />
            </button>
          </header>
          <div className="users flex flex-col gap-2 p-2">
            {project.users && project.users.map((user, index) => {
              return (
                <div key={user._id || index} className="users flex flex-col gap-2 p-2">
                  <div className="user cursor-pointer hover:bg-slate-300 p-2 flex gap-2 items-center">
                    <div className="aspect-square rounded-full w-fit h-fit flex items-center text-white justify-center p-5 bg-slate-500">
                      <UserRoundCheck className="absolute" />
                    </div>
                    <h1 className="font-semibold text-lg">{user.email}</h1>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto p-4 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Select Users to Add</h2>

            <div className="space-y-2 pb-16 max-h-96 overflow-auto">
              {users.map((user) => {
                const isSelected = selectedUserId.has(user._id);

                return (
                  <div
                    key={user._id}
                    onClick={() =>
                      setSelectedUserId((prev) => {
                        const newSet = new Set(prev);
                        if (newSet.has(user._id)) {
                          newSet.delete(user._id);
                        } else {
                          newSet.add(user._id);
                        }
                        return newSet;
                      })
                    }
                    className={`p-3 ${
                      isSelected ? "bg-slate-300" : "bg-gray-100"
                    } hover:bg-gray-200 cursor-pointer rounded flex gap-2 items-center`}
                  >
                    <User />
                    {user.email}
                  </div>
                );
              })}
            </div>

            <button
              className="absolute bottom-4 left-4 right-4 bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
              onClick={handleAddCollaborators}
            >
              Add {selectedUserId.size} Collaborator{selectedUserId.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Projects;