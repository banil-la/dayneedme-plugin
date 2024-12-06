import { h } from "preact";
import LogoutButton from "./LogoutButton";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "preact/hooks";

const Profile: React.FC = () => {
  const { authToken } = useAuth();
  console.log("Profile: authToken =", authToken);

  useEffect(() => {
    console.log("Profile: authToken changed =", authToken);
  }, [authToken]);

  if (!authToken) {
    return <p>Loading...</p>;
  }
  return (
    <div className="flex justify-between p-4">
      <div className="flex items-center gap-2">
        <div className="min-w-7 w-7 aspect-square rounded-full bg-slate-300" />
        <p>NAME</p>
        <p>Token: {authToken}</p>
      </div>
      <LogoutButton />
    </div>
  );
};

export default Profile;
