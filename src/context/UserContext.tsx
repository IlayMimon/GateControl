import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

export type SpGroup = {
  Id: number;
  Title: string;
  Description: string;
};

export type CurrentUser = {
  Id: number;
  Title: string;
  Email: string;
  LoginName: string;
  IsSiteAdmin: boolean;
};

type UserContextType = {
  currentUser: CurrentUser | null;
  groups: SpGroup[];
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [groups, setGroups] = useState<SpGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const [userRes, groupsRes] = await Promise.all([
          axios.get<{ d: CurrentUser }>("/_api/web/currentuser"),
          axios.get<{ d: { results: SpGroup[] } }>("/_api/web/currentuser/groups"),
        ]);
        setCurrentUser(userRes.data.d);
        setGroups(groupsRes.data.d.results.map((g) => ({
          Id: g.Id,
          Title: g.Title,
          Description: g.Description,
        })));
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, groups, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};
