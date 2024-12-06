// src/components/Profile.tsx

import { h } from "preact";
import LogoutButton from "./LogoutButton";
import { useEffect } from "preact/hooks";
import { useAuth } from "../../context/AuthContext";

interface AuthToken {
  access_token?: string;
}

const Profile: React.FC = () => {
  const { authToken, isLoading } = useAuth();
  console.log("Profile: authToken =", authToken, "isLoading =", isLoading);

  useEffect(() => {
    console.log("Profile: authToken changed =", authToken);
  }, [authToken]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!authToken) {
    return <p>Not authenticated</p>;
  }

  // authToken이 객체인 경우를 처리
  const tokenToDisplay =
    typeof authToken === "object" && authToken !== null
      ? (authToken as AuthToken).access_token
      : authToken;

  return (
    <div className="flex justify-between p-4">
      <div className="flex items-center gap-2">
        <div className="min-w-7 w-7 aspect-square rounded-full bg-slate-300" />
        <p>NAME</p>
      </div>
      <LogoutButton />
      {/* <p className="overflow-x-scroll">Token: {tokenToDisplay}</p> */}
    </div>
  );
};

export default Profile;
