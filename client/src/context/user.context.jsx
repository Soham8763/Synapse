import { createContext, useState, useContext } from 'react';

// Create the user context
export const UserContext = createContext();

// Create a provider component
export function UserProvider({ children }) {
    const [user, setUser] = useState(null);

    return (
        <UserContext.Provider value={{user,setUser}}>
            {children}
        </UserContext.Provider>
    );
}
