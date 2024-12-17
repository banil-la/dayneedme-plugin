// src/components/Profile.tsx

import { Fragment, h } from "preact";
import LogoutButton from "./LogoutButton";
import { useEffect } from "preact/hooks";
import { useAuth } from "../../context/AuthContext";
import EnvironmentSwitcher from "../EnviromentSwitcher";

interface AuthToken {
  access_token?: string;
}

const Profile: React.FC = () => {
  const { authToken, isLoading, user } = useAuth();
  console.log(
    "Profile: authToken =",
    authToken ? "exist" : "not exist",
    "isLoading =",
    isLoading
  );

  useEffect(() => {
    console.log(
      "Profile: authToken changed =",
      authToken ? "exist" : "not exist"
    );
  }, [authToken]);

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
            <div class={`flex flex-col gap-2`}>
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
