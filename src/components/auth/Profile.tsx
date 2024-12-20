// src/components/Profile.tsx

import { Fragment, h } from "preact";
import LogoutButton from "./LogoutButton";
import { useEffect } from "preact/hooks";
import { useAuth } from "../../context/AuthContext";
import EnvironmentSwitcher from "../EnviromentSwitcher";

const Profile: React.FC = () => {
  const { authToken, isLoading, user } = useAuth();

  console.log("[Profile] authToken:", authToken);
  console.log("[Profile] isLoading:", isLoading);
  console.log("[Profile] user:", user);

  useEffect(() => {
    console.log("[Profile] authToken changed:", authToken);
    console.log("[Profile] user changed:", user);
  }, [authToken, user]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!authToken) {
    return <p>Not authenticated</p>;
  }

  return (
    <div className="flex justify-between p-4">
      {user ? (
        <Fragment>
          <div className="flex items-center gap-2">
            <div className="min-w-7 w-7 aspect-square rounded-full bg-slate-300" />
            <div className={`flex flex-col gap-2`}>
              <p>{user?.email}</p>
              {user?.role === "superadmin" && <EnvironmentSwitcher />}
            </div>
          </div>
          <LogoutButton />
        </Fragment>
      ) : (
        <Fragment>
          <p>Loading...</p>
          <LogoutButton />
        </Fragment>
      )}
    </div>
  );
};

export default Profile;
