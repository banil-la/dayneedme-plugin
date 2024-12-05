import { h } from "preact";
import LogoutButton from "./LogoutButton";
import { useAuth } from "../../context/AuthContext";

const Profile: React.FC = () => {
  const { authToken } = useAuth();

  return (
    <div>
      <p>Profile</p>
      <p>Token: {authToken}</p>
      <LogoutButton />
    </div>
  );
};

export default Profile;
